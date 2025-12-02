// ============================================
// ELTERNGELD FORM EXTENSION
// ============================================

const createElterngeldForm = () => ({
    name: "ElterngeldForm",
    type: "response",
    match: ({ trace }: any) =>
        trace.type === "Elterngeld_Form" ||
        trace.payload?.name === "Elterngeld_Form",
    render: ({ element }: any) => {
        const wrapper = document.createElement("div")
        wrapper.innerHTML = `
          <style>${SHARED_FORM_STYLES}</style>

          <div class="vf-card">
            <svg class="vf-success-icon" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="28"/>
              <path d="M16 30 L26 40 L44 20" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="vf-success-message">PDF wird generiert... 📄</div>

            <form class="vf-form" novalidate>
              <div class="vf-step-title">Angaben zum Kind</div>

              <div class="vf-row vf-row--double">
                <div class="vf-field">
                  <div class="vf-label">Vorname des Kindes</div>
                  <input
                    type="text"
                    class="vf-input child-firstname"
                    required
                    autocomplete="given-name"
                    autocapitalize="words"
                    minlength="2"
                    maxlength="50"
                    aria-label="Vorname des Kindes"
                  />
                  <svg class="vf-validation-icon success" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <svg class="vf-validation-icon error" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <div class="vf-field-error"></div>
                </div>
                <div class="vf-field">
                  <div class="vf-label">Nachname des Kindes</div>
                  <input
                    type="text"
                    class="vf-input child-lastname"
                    required
                    autocomplete="family-name"
                    autocapitalize="words"
                    minlength="2"
                    maxlength="50"
                    aria-label="Nachname des Kindes"
                  />
                  <svg class="vf-validation-icon success" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <svg class="vf-validation-icon error" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <div class="vf-field-error"></div>
                </div>
              </div>

              <div class="vf-row">
                <div class="vf-field">
                  <div class="vf-label">Geburtsdatum (TT.MM.JJJJ)</div>
                  <input
                    type="text"
                    class="vf-input child-birthdate"
                    required
                    placeholder="15.04.2025"
                    pattern="\\d{2}\\.\\d{2}\\.\\d{4}"
                    maxlength="10"
                    aria-label="Geburtsdatum"
                  />
                  <svg class="vf-validation-icon success" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <svg class="vf-validation-icon error" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <div class="vf-field-error"></div>
                </div>
              </div>

              <div class="vf-row">
                <div class="vf-field">
                  <div class="vf-label">Anzahl der Kinder (bei Mehrlingsgeburten)</div>
                  <input
                    type="number"
                    class="vf-input num-children"
                    min="1"
                    max="5"
                    value="1"
                    aria-label="Anzahl der Kinder"
                  />
                  <div class="vf-field-error"></div>
                </div>
              </div>

              <div class="vf-row" style="margin-top: 12px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #525252;">
                  <input type="checkbox" class="is-premature" style="width: 18px; height: 18px; cursor: pointer;" />
                  <span>Kind wurde 6+ Wochen zu früh geboren</span>
                </label>
              </div>

              <div class="vf-row premature-field" style="display: none; margin-top: 8px;">
                <div class="vf-field">
                  <div class="vf-label">Errechneter Geburtstermin (TT.MM.JJJJ)</div>
                  <input
                    type="text"
                    class="vf-input original-duedate"
                    placeholder="01.06.2025"
                    pattern="\\d{2}\\.\\d{2}\\.\\d{4}"
                    maxlength="10"
                    aria-label="Errechneter Geburtstermin"
                  />
                  <div class="vf-field-error"></div>
                </div>
              </div>

              <div class="vf-row" style="margin-top: 12px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #525252;">
                  <input type="checkbox" class="has-disability" style="width: 18px; height: 18px; cursor: pointer;" />
                  <span>Kind hat eine Behinderung</span>
                </label>
              </div>

              <div class="vf-footer">
                <button type="submit" class="vf-submit" aria-label="PDF generieren">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke-width="2.5" viewBox="0 0 24 24">
                    <path d="M12 19V5m0 0l-7 7m7-7l7 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <div class="vf-spinner"></div>
                </button>
              </div>
            </form>
          </div>`

        setupElterngeldForm(wrapper)
        element.appendChild(wrapper)
    },
})

function setupElterngeldForm(wrapper: HTMLElement) {
    const formEl = wrapper.querySelector<HTMLFormElement>(".vf-form")
    const submitBtn = wrapper.querySelector<HTMLButtonElement>(".vf-submit")
    const successIcon = wrapper.querySelector<SVGElement>(".vf-success-icon")
    const successMessage = wrapper.querySelector<HTMLDivElement>(
        ".vf-success-message"
    )

    const firstNameInput = wrapper.querySelector<HTMLInputElement>(".child-firstname")
    const lastNameInput = wrapper.querySelector<HTMLInputElement>(".child-lastname")
    const birthDateInput = wrapper.querySelector<HTMLInputElement>(".child-birthdate")
    const numChildrenInput = wrapper.querySelector<HTMLInputElement>(".num-children")
    const isPrematureCheckbox = wrapper.querySelector<HTMLInputElement>(".is-premature")
    const hasDisabilityCheckbox = wrapper.querySelector<HTMLInputElement>(".has-disability")
    const originalDueDateInput = wrapper.querySelector<HTMLInputElement>(".original-duedate")
    const prematureField = wrapper.querySelector<HTMLElement>(".premature-field")

    // Show/hide due date field
    isPrematureCheckbox?.addEventListener("change", () => {
        if (prematureField) {
            prematureField.style.display = isPrematureCheckbox.checked ? "block" : "none"
        }
    })

    // Add validation to all inputs
    const inputs = [firstNameInput, lastNameInput, birthDateInput]
    inputs.forEach((input) => {
        if (!input) return

        const fieldContainer = input.closest(".vf-field")
        const successIcon = fieldContainer?.querySelector(".vf-validation-icon.success")
        const errorIcon = fieldContainer?.querySelector(".vf-validation-icon.error")

        input.addEventListener("focus", () => {
            fieldContainer?.classList.add("focused")
        })

        input.addEventListener("blur", () => {
            fieldContainer?.classList.remove("focused")
            if (!input.value) {
                fieldContainer?.classList.remove("filled")
            } else {
                fieldContainer?.classList.add("filled")
            }
        })

        input.addEventListener("input", () => {
            if (input.value) {
                fieldContainer?.classList.add("filled")
            } else {
                fieldContainer?.classList.remove("filled")
            }

            if (input.classList.contains("invalid")) {
                input.classList.remove("invalid")
                errorIcon?.classList.remove("show")
            }

            if (input.value && input.checkValidity()) {
                input.classList.add("valid")
                successIcon?.classList.add("show")
            } else {
                input.classList.remove("valid")
                successIcon?.classList.remove("show")
            }
        })
    })

    // Date formatting helper
    birthDateInput?.addEventListener("input", (e) => {
        const input = e.target as HTMLInputElement
        let value = input.value.replace(/\D/g, "")
        if (value.length >= 2) value = value.slice(0, 2) + "." + value.slice(2)
        if (value.length >= 5) value = value.slice(0, 5) + "." + value.slice(5, 9)
        input.value = value
    })

    originalDueDateInput?.addEventListener("input", (e) => {
        const input = e.target as HTMLInputElement
        let value = input.value.replace(/\D/g, "")
        if (value.length >= 2) value = value.slice(0, 2) + "." + value.slice(2)
        if (value.length >= 5) value = value.slice(0, 5) + "." + value.slice(5, 9)
        input.value = value
    })

    const validateForm = (): boolean => {
        let isValid = true

        if (!firstNameInput?.value || firstNameInput.value.length < 2) {
            firstNameInput?.classList.add("invalid")
            isValid = false
        }

        if (!lastNameInput?.value || lastNameInput.value.length < 2) {
            lastNameInput?.classList.add("invalid")
            isValid = false
        }

        if (!birthDateInput?.value || !/^\d{2}\.\d{2}\.\d{4}$/.test(birthDateInput.value)) {
            birthDateInput?.classList.add("invalid")
            isValid = false
        }

        return isValid
    }

    const handleSubmit = async (e: Event) => {
        e.preventDefault()

        if (!validateForm()) {
            if ("vibrate" in navigator) navigator.vibrate(50)
            return
        }

        submitBtn?.classList.add("loading")
        if (submitBtn) submitBtn.disabled = true

        try {
            // Call the Elterngeld API
            const response = await fetch(
                "https://elterngeld-pdf-api.vercel.app/api/fill-elterngeld",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        childFirstName: firstNameInput?.value || "",
                        childLastName: lastNameInput?.value || "",
                        childBirthDate: birthDateInput?.value || "",
                        numberOfChildren: parseInt(numChildrenInput?.value || "1"),
                        isPremature: isPrematureCheckbox?.checked || false,
                        originalDueDate: originalDueDateInput?.value || "",
                        hasDisability: hasDisabilityCheckbox?.checked || false,
                    }),
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "API-Fehler")
            }

            const result = await response.json()

            if ("vibrate" in navigator) navigator.vibrate([30, 10, 30])

            formEl?.style.setProperty("display", "none")
            successIcon?.classList.add("show")
            if (successMessage) {
                successMessage.textContent = "PDF erfolgreich erstellt! ✅"
                successMessage.classList.add("show")
            }

            // Send the download URL back to Voiceflow
            setTimeout(() => {
                ;(window as any).voiceflow.chat.interact({
                    type: "complete",
                    payload: {
                        downloadUrl: result.downloadUrl,
                        filename: result.filename,
                        childFirstName: firstNameInput?.value,
                        childLastName: lastNameInput?.value,
                    },
                })
            }, 1000)
        } catch (error) {
            console.error("Error:", error)
            alert(
                "Fehler beim Generieren des PDFs. Bitte versuchen Sie es erneut."
            )
            submitBtn?.classList.remove("loading")
            if (submitBtn) submitBtn.disabled = false
        }
    }

    formEl?.addEventListener("submit", handleSubmit)
    submitBtn?.addEventListener("click", handleSubmit)
}
