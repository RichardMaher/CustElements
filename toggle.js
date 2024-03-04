import sheet from './toggle.css' assert {type: 'css'};

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
		this.#shadowRoot.adoptedStyleSheets = [sheet];	
		this.#internals = this.attachInternals();
		this.#internals.ariaRole = "checkbox";
		
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
		
		if (this.hasAttribute("checked")) 
		{
			let checked = this.getAttribute("checked");
			this.#checkbox.checked  = (String(checked).toLowerCase() === "true");
		}
		else
		{
			this.setAttribute("checked", false);
			this.#checkbox.checked = false;
		}
		
		this.initialState = this.#checkbox.checked;
		this.setAttribute("aria-checked", this.#checkbox.checked);
		
		if (this.hasAttribute("disabled")) 
		{
			let disabled = this.getAttribute("disabled");
			this.#checkbox.disabled  = (String(disabled).toLowerCase() === "true");
		}
		else
		{
			this.setAttribute("disabled", false);
			this.#checkbox.disabled = false;
		}
		
		this.setAttribute("aria-disabled", this.#checkbox.disabled);
		
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
				e.preventDefault();
			}
		});
		
		this.#toggle.addEventListener('keyup', (e) => {
				if (e.altKey || e.ctrlKey || e.isComposing || e.metaKey || e.shiftKey)
					return;
				
				if (e.keyCode == 32 || e.keyCode == 13)
				{
					console.log("key = " + e.keyCode);
					e.preventDefault();
					this.#toggle.click();	
				}
			});
		
		this.#toggle.addEventListener('click', (e) => {
				console.log("Inside " + this.#checkbox.checked + " " + e.target.tagName);

				if (e.target.tagName == "LABEL") {
					e.stopPropagation();
					return;
				}

				this.setAttribute("checked", this.#checkbox.checked);
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
		
		var label = this.#shadowRoot.querySelector("label.exo");
		var labelBefore = getComputedStyle(label, "before");
		var labelAfter  = getComputedStyle(label, "after");
		
		var resultIndex = null;
		
		if (!isNaN(labelBefore.zIndex))
		{
			resultIndex = labelBefore.zIndex
		}
		
		if (!isNaN(labelAfter.zIndex))
		{
			resultIndex = resultIndex == null ? labelAfter.zIndex : (Math.max(resultIndex, labelAfter.zIndex));
		}
		
		var sliderIndex = resultIndex == null ? "auto" : resultIndex + 1; 
		
		label.style.setProperty("--switch-z-index", sliderIndex);
    }

    disconnectedCallback() 
	{
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.isConnected) return;
		
		console.log("Change " + name + " value " + newValue);
			
        if (newValue == null) {
            this[name] = "";
            delete this[name];
            return;
        }

		switch	(name) {
			case	"checked":
				break;
			case	"disabled":
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
	}
	
	formResetCallback() {
		this.setAttribute("checked", this.#initialState);
	}

    get checked() {
        return this.#checkbox.checked;
    }
    set checked(newValue) {
		this.#checkbox.checked = (String(newValue).toLowerCase() === "true");
        this.setAttribute("checked", this.#checkbox.checked);
        this.setAttribute("aria-checked", this.#checkbox.checked);
    }

    get disabled() {
        return this.#checkbox.disabled;
    }
    set disabled(newValue) {
		this.#checkbox.disabled = (String(newValue).toLowerCase() === "true");
        this.setAttribute("disabled", this.#checkbox.disabled);
        this.setAttribute("aria-disabled", this.#checkbox.disabled);
    }

    get value() {
        return this.getAttribute("value");
    }
    set value(newValue) {
        this.setAttribute("value", newValue);
    }
}
customElements.define('abc-toggle', ABCToggle);