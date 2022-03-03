'use strict';
class ABCSlider extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: 'open' });

        // Because we didn't want to inherit from HTMLInputElement

        const holder = document.createElement('div');
        const statusPosition = "statusposition";
        const _base = document.createElement('input');

        _base.setAttribute('type', 'range');
        _base.setAttribute('part', 'slider');

        let _positionStatus = "right";
        if (this.hasAttribute(statusPosition)) 
            _positionStatus = this.getAttribute(statusPosition).toLowerCase();

        if (_positionStatus == "bottom" || _positionStatus == "top")
            holder.style.display = "block";
        else
            if (_positionStatus == "left" || _positionStatus == "right")
                holder.style.display = "flex";
            else
                _positionStatus = "none";

        if (_positionStatus != "none") {

            if (_positionStatus == "bottom" || _positionStatus == "right")
                holder.appendChild(_base);

            // Let the caller style and set the text via slots

            let _slotOption = [
                { "name": "lowWater", "textContent": "Min ${this.value}" },
                { "name": "highWater", "textContent": "Max ${this.value}" },
                { "name": "twixtWater", "textContent": "${this.value}" }
            ];

            let _slot = [];

            for (let i = 0; i < _slotOption.length; i++) {
                _slot[i] = document.createElement('slot');
                for (let attr in _slotOption[i]) {
                    _slot[i][attr] = _slotOption[i][attr];
                }
                holder.appendChild(_slot[i]);
                _slotOption[i].textOwner = _slot[i];
                _slotOption[i].templateText = _slot[i].firstChild.textContent;
            }

            this.slots = _slot;
            this.slotOption = _slotOption;
        }

        if (_positionStatus == "left" || _positionStatus == "top")
            holder.appendChild(_base);

        holder.addEventListener('slotchange', this.slotChanged.bind(this));

        this.base = _base;
        this.positionStatus = _positionStatus;
        this.currOption = null;

        const style = document.createElement('style');

        style.textContent = `
            ::slotted(*) {
                font-weight: bold;
            }
            slot {
                color: blue;
                display: none;
                margin-left: 0.5em;
            }

            input[type='range'] {
                outline: none;
                padding: 0px;
                margin: 0px;
                -webkit-appearance: none;
                border-radius: 0.5em;
                box-shadow: inset 0 0 0.5em #333;
                background-color: #004242;
                height: 0.8em;
                vertical-align: middle;
            }

            input[type='range']:hover {
                cursor: pointer;
            }

            input[type='range']::-moz-range-track {
                -moz-appearance: none;
                border-radius: 0.5em;
                border: none;
                box-shadow: inset 0 0 0.5em #333;
                background: #004242;
                height: 0.8em;
                vertical-align: middle;
            }

            input[type='range']::-webkit-slider-thumb {
                -webkit-appearance: none !important;
                border-radius: 1.75em;
                background-color: #00bf00;
                box-shadow:inset 0 0 1.0em rgba(000,000,000,0.5);
                border: 1px solid #217812;
                height: 1.5em;
                width: 1.5em;
            }

            input[type='range']::-moz-range-thumb {
                -moz-appearance: none;
                border-radius: 1.75em;
                background: #00bf00;
                box-shadow:inset 0 0 1.0em rgba(000,000,000,0.5);
                border: 1px solid #217812;
                height: 1.75em;
                width: 1.75em;
            }

            div {
                display: block;
                line-height: 0.8;
                margin-left: 0.5em;
            }
        `;

        shadowRoot.appendChild(style);
        shadowRoot.appendChild(holder);
    }

    static get observedAttributes() {
        return ['value', 'min', 'max', 'step'];
    }

    connectedCallback() {
        console.log('Connected ' + this.isConnected);

        if (!this.isConnected) return;

        this.addEventListener('change', this.valueChanged);
        this.addEventListener('input', this.valueChanged);
    }

    disconnectedCallback() {
        this.removeEventListener('change', this.valueChanged);
        this.removeEventListener('input', this.valueChanged);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.isConnected) return;

        if (newValue == null) {
            console.log(name + " removed");
            this.base.removeAttribute(name);
            this.base[name] = "";
            delete this.base[name];
            this[name] = "";
            delete this[name];
            return;
        }

        console.log(name + " changed");

        if (isNaN(newValue))
            throw new Error(this.tagName + ", Illegal value. [" + name + "] must be a number.");

        // Validate all attribute values 

        const inheritAttr = this.constructor.observedAttributes;

        var currVars = {};
        for (let i = 0; i < inheritAttr.length; i++) {
            if (this.hasAttribute(inheritAttr[i]))
                currVars[inheritAttr[i]] = this.getAttribute(inheritAttr[i]);
            else
                if (this.base.hasAttribute(inheritAttr[i]))
                    currVars[inheritAttr[i]] = this.base[inheritAttr[i]]; // Use getter

            if (currVars[inheritAttr[i]] != null)
                currVars[inheritAttr[i]] = parseInt(currVars[inheritAttr[i]], 10);
        }

        var newPos = null;
        if (currVars.value != null) {
            newPos = 2;
            if (currVars.min != null) {
                if (currVars.min > currVars.value) {
                    this.removeAttribute("min");
                    throw new Error(this.tagName + ", Illegal value. Min cannot be greater than Value.");
                }
                if (currVars.min == currVars.value)
                    newPos = 0;
            }
            if (currVars.max != null) {
                if (currVars.max < currVars.value) {
                    this.removeAttribute("max");
                    throw new Error(this.tagName + ", Illegal value. Max cannot be less than Value.");
                }
                if (currVars.max == currVars.value)
                    newPos = 1;
            }
        } else
            if (currVars.min != null && currVars.max != null && currVars.max < currVars.min) {
                this.removeAttribute("min");
                this.removeAttribute("max");
                throw new Error(this.tagName + ", Illegal value. Max cannot be less than Min.");
            }

        this.base.setAttribute(name, newValue);
        if (this.base[name])
            this.base[name] = newValue;

        if (this.positionStatus != "none" && newPos != null) {
            this.parseStatus(newPos, currVars);
        }
    }

    valueChanged(e) {
        this.value = this.base.value;
        console.log("value changed " + this.base.value);
    }

    slotChanged(e) {
        if (this.positionStatus == "none") return;

        let nodes = e.srcElement.assignedNodes();
        console.log("slot changed " + e.srcElement.name + " " + nodes[0].outerHTML);

        if (nodes[0].childNodes[0].nodeType == 3 && nodes[0].childNodes[0].nodeName == "#text") {
            let targetSlot = this.slotOption.find((elem) => {
                return elem.name == e.srcElement.name;
            });
            if (targetSlot != undefined) {
                targetSlot.textOwner = nodes[0];
                targetSlot.templateText = nodes[0].firstChild.textContent;
            }
        }

        this.value = this.value // Force an attribute change event and use new status message.
    }

    parseStatus(newPos, currVars) {
        if (newPos != this.currOption) {
            for (let i = 0; i < this.slots.length; i++) {
                this.slots[i].style.display = "";
            }
            this.currOption = newPos;
            console.log("currOption" + this.currOption);
            this.slots[this.currOption].style.display = "block";
        }

        const applyTemplate = function (statusString) {
            return new Function("return `" + statusString + "`;").call(currVars);
        }

        try {
            let msg = applyTemplate(this.slotOption[this.currOption].templateText);
            this.slotOption[this.currOption].textOwner.firstChild.textContent = msg;
            console.log(msg);
        } catch (e) {
            console.log(e.message);
        }
    }

    // getters and setters. Just reflect property values back to attributes, where appropriate.

    get value() {
        console.log("in get value");
        return parseInt(this.getAttribute('value'), 10);
    }
    set value(newValue) {
        console.log("in set value");
        this.setAttribute('value', newValue);
    }
    get min() {
        parseInt(this.setAttribute('min', newValue), 10);
    }
    set min(newValue) {
        this.setAttribute('min', newValue);
    }
    get max() {
        parseInt(this.setAttribute('max', newValue), 10);
    }
    set max(newValue) {
        this.setAttribute('max', newValue);
    }
    get step() {
        parseInt(this.setAttribute('step', newValue), 10);
    }
    set step(newValue) {
        this.setAttribute('step', newValue);
    }
}
customElements.define('abc-slider', ABCSlider);