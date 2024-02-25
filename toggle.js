import sheet from './toggle.css' assert {type: 'css'};

export class ABCToggle extends HTMLElement 
{
	#shadowRoot;
	#toggle;
	#checkbox;
	
    constructor() {
        super();

        this.#shadowRoot = this.attachShadow({ mode: 'open' });
		this.#shadowRoot.adoptedStyleSheets = [sheet];		
		this.#toggle = document.createElement('label');
		this.#toggle.classList.add("switch");
		this.#toggle.part = "label";

		this.#checkbox = document.createElement('input');	
		this.#checkbox.classList.add("checkbox");		
		this.#checkbox.type = "checkbox";
		
		if (this.hasAttribute("checked")) 
		{
			let checked = this.getAttribute("checked");
			this.#checkbox.checked  = (String(checked).toLowerCase() === "true");
		}
		else
		{
			this.#checkbox.checked = false;
		}
		
		if (this.hasAttribute("disabled")) 
		{
			let disabled = this.getAttribute("disabled");
			this.#checkbox.disabled  = (String(disabled).toLowerCase() === "true");
		}
		else
		{
			this.#checkbox.disabled = false;
		}
		
		this.#toggle.addEventListener('click', (e) => {
				console.log("Inside " + this.#checkbox.checked + " " + e.target.tagName);
				if (e.target.tagName == "LABEL") {
					e.stopPropagation();
					return;
				}
				this.setAttribute("checked", this.#checkbox.checked);
			})


		this.#toggle.appendChild(this.#checkbox);
		
        let span = document.createElement('span'); 
		span.classList.add("slider");	
		this.#toggle.appendChild(span);
						
		this.#shadowRoot.appendChild(this.#toggle);
		
    }

    static get observedAttributes() {
        return ['checked', 'disabled'];
    }

    connectedCallback() {

        if (!this.isConnected) return;
		
		let parentStyle = getComputedStyle(this.#shadowRoot.host);
		this.#shadowRoot.host.style.setProperty('--default-toggle-fg-color', parentStyle.backgroundColor);
		this.#shadowRoot.host.style.setProperty('--default-toggle-bg-color', parentStyle.color);
		
		var label = this.#shadowRoot.querySelector("label.switch");
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
				
		console.log("zIndex = " + sliderIndex);
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
	}

    get checked() {
        return this.#checkbox.checked;
    }
    set checked(newValue) {
		this.#checkbox.checked = (String(newValue).toLowerCase() === "true");
        this.setAttribute("checked", this.#checkbox.checked);
    }

    get disabled() {
        return this.#checkbox.disabled;
    }
    set disabled(newValue) {
		this.#checkbox.disabled = (String(newValue).toLowerCase() === "true");
        this.setAttribute("disabled", this.#checkbox.disabled);
    }
}
customElements.define('abc-toggle', ABCToggle);