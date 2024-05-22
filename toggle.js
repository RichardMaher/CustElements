export class ABCToggle extends HTMLElement 
{
	static formAssociated = true;
	
	#shadowRoot;
	#internals;
	#toggle;
	#checkbox;
	#initialState;
	#typeClass;
	
    constructor() {
        super();

        this.#shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.#internals = this.attachInternals();
		this.#internals.ariaRole = "checkbox";
		
		let link = document.createElement('link');
		link.href = "./toggle.css";
		link.rel = "stylesheet";
		link.type = "text/css";
		this.#shadowRoot.appendChild(link);
		
		this.#toggle = document.createElement('label');
		this.#toggle.classList.add("exo");
		this.#toggle.part = "exo";

		this.#checkbox = document.createElement('input');	
		this.#checkbox.classList.add("checkbox");		
		this.#checkbox.type = "checkbox";
				
		this.#toggle.appendChild(this.#checkbox);
		
        let span = document.createElement('span'); 
		span.classList.add("endo");	
		span.part = "endo";

		this.#toggle.appendChild(span);

		this.#typeClass = "toggle";
		if (this.hasAttribute("type")) 
		{
			let myType = this.getAttribute("type");
			if (String(myType).toLowerCase() == "tick")
			{
				this.#typeClass = "tick";
			}
		}
		this.#toggle.classList.add(this.#typeClass);
		span.classList.add(this.#typeClass);

		this.initialState = this.hasAttribute("checked");		
		if (this.initialState) 
		{
			this.#checkbox.setAttribute("checked", "true");
		}
		
		this.setAttribute("aria-checked", this.initialState);
		
		if (this.hasAttribute("disabled")) 
		{
			this.#checkbox.setAttribute("disabled", "true");
		}
		
		this.setAttribute("aria-disabled", this.hasAttribute("disabled"));
		
		let value = "";
		if (this.hasAttribute("value")) 
		{
			value = this.getAttribute("value");
		}
		else
		{
			this.setAttribute("value", "");
		}
		this.#internals.setFormValue(value);
									
		this.#toggle.addEventListener('keydown', (e) => {
			if (e.altKey || e.ctrlKey || e.isComposing || e.metaKey || e.shiftKey)
				return;
			
			if (e.keyCode == 32 || e.keyCode == 13)
			{
				e.preventDefault(); // NB: This will prevet click event and form submission
			}
		});
		
		this.#toggle.addEventListener('keyup', (e) => {
				if (e.altKey || e.ctrlKey || e.isComposing || e.metaKey || e.shiftKey)
					return;
				
				if (e.keyCode == 32 || e.keyCode == 13)
				{
					console.log("key = " + e.keyCode);
					e.preventDefault();
					this.#checkbox.click();
				}
			});
		
		this.#toggle.addEventListener('click', (e) => {				
                        console.warn(e.target.nodeName, e.composedPath());
                        console.warn(e.target?.tagName, e.currentTarget?.tagName, e.originalTarget?.tagName);
				let trueTarget = null;
				switch	(true) {
					case	(e.target.tagName == "INPUT"):
							trueTarget = e.target;
							break;
					case	(e.currentTarget.tagName == "INPUT"):
							trueTarget = e.currentTarget;
							break;
					case	(e.originalTarget != undefined && e.originalTarget.tagName == "INPUT"):
							trueTarget = e.originalTarget;
							break;
					default:
				}

				if (trueTarget == null) {
					e.stopPropagation();
					return;
				}
				
				console.log("Inside " + this.#checkbox.checked + " " + trueTarget.tagName);
				
				this.checked = this.#checkbox.checked ? true : false;

				this.setAttribute("aria-checked", this.#checkbox.checked);				
			})
						
		this.#shadowRoot.appendChild(this.#toggle);	 
    }

    static get observedAttributes() {
        return ['checked', 'disabled', 'value'];
    }

    connectedCallback() {

        if (!this.isConnected) return;
		
		let parentStyle = getComputedStyle(this.#shadowRoot.host);
		
		if (parentStyle.backgroundColor.replace(/ /g,"") != "rgba(0,0,0,0)")
			this.#shadowRoot.host.style.setProperty('--default-toggle-fg-color', parentStyle.backgroundColor);
		
		this.#shadowRoot.host.style.setProperty('--default-toggle-bg-color', parentStyle.color);
		
		let label = this.#shadowRoot.querySelector("label.exo");
		let labelBefore = getComputedStyle(label, "before");
		let labelAfter  = getComputedStyle(label, "after");
		
		let resultIndex = null;
		
		if (!isNaN(labelBefore.zIndex))
		{
			resultIndex = labelBefore.zIndex
		}
		
		if (!isNaN(labelAfter.zIndex))
		{
			resultIndex = resultIndex == null ? labelAfter.zIndex : (Math.max(resultIndex, labelAfter.zIndex));
		}
		
		let sliderIndex = resultIndex == null ? 2 : resultIndex + 1; 
		
		label.style.setProperty("--switch-z-index", sliderIndex);
    }

    disconnectedCallback() 
	{
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.isConnected) return;
		
		console.log("Change " + name + " value " + newValue);

		switch	(name) {
			case	"checked":
			case	"disabled":
				if (this.hasAttribute(name)) {
					this.#checkbox[name] = newValue;
					this.setAttribute("aria-"+name, "true");
				} else {
					this.#checkbox.removeAttribute(name);
					this.setAttribute("aria-"+name, "false");
				}
				break;
			case	"value":
				this.#internals.setFormValue(newValue);
				
			    if (true) { // No real validation on a checkbox :-)
					this.#internals.setValidity({ });
					break;
				}
				
				this.#internals.setValidity({badInput: true}, 
					'Invalid Value', this.#shadowRoot.querySelector("span"));
				this.#internals.reportValidity();
				break;
			default:
				throw new Error("Unknown attribute modified " + name);
		}
					
        if (newValue == null) {
            this[name] = "";
            delete this[name];
            return;
        }
	}
	
	formResetCallback() {
		if (this.#initialState) {
			this.setAttribute("checked", this.#initialState);
		} else {
			this.removeAttribute("checked");
		}
	}

    get checked() {
        return this.hasAttribute("checked");
    }
	
    set checked(newValue) {
		if (String(newValue).toLowerCase() !== "true") {
			this.removeAttribute("checked")
		} else {
			this.setAttribute("checked", "true");
		}
    }
	
    get disabled() {
        return this.hasAttribute("disabled");
    }
	
    set disabled(newValue) {
		if (String(newValue).toLowerCase() !== "true") {
			this.removeAttribute("disabled")
		} else {
			this.setAttribute("disabled", "true");
		}
    }

    get value() {
        return this.getAttribute("value");
    }
	
    set value(newValue) {
        this.setAttribute("value", newValue);
    }
	
	get form() { 
		return this.#internals.form; 
	}
}
customElements.define('abc-toggle', ABCToggle);