// Updated setupElterngeldForm function
// Replace the existing setupElterngeldForm in your Framer component with this:

function setupElterngeldForm(wrapper: HTMLElement) {
    const formEl = wrapper.querySelector<HTMLFormElement>(".vf-form")
    const submitBtn = wrapper.querySelector<HTMLButtonElement>(".vf-submit")
    const successIcon = wrapper.querySelector<SVGElement>(".vf-success-icon")
    const successMessage = wrapper.querySelector<HTMLDivElement>(
        ".vf-success-message"
    )

    const firstNameInput =
        wrapper.querySelector<HTMLInputElement>(".child-firstname")
    const lastNameInput =
        wrapper.querySelector<HTMLInputElement>(".child-lastname")
    const birthDateInput =
        wrapper.querySelector<HTMLInputElement>(".child-birthdate")
    const numChildrenInput =
        wrapper.querySelector<HTMLInputElement>(".num-children")
    const isPrematureCheckbox =
        wrapper.querySelector<HTMLInputElement>(".is-premature")
    const hasDisabilityCheckbox =
        wrapper.querySelector<HTMLInputElement>(".has-disability")
    const originalDueDateInput =
        wrapper.querySelector<HTMLInputElement>(".original-duedate")
    const prematureField =
        wrapper.querySelector<HTMLElement>(".premature-field")

    // Show/hide due date field
    isPrematureCheckbox?.addEventListener("change", () => {
        if (prematureField) {
            prematureField.style.display = isPrematureCheckbox.checked
                ? "block"
                : "none"
        }
    })

    // Add validation to all inputs
    const inputs = [firstNameInput, lastNameInput, birthDateInput]
    inputs.forEach((input) => {
        if (!input) return

        const fieldContainer = input.closest(".vf-field")
        const successIcon = fieldContainer?.querySelector(
            ".vf-validation-icon.success"
        )
        const errorIcon = fieldContainer?.querySelector(
            ".vf-validation-icon.error"
        )

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
        if (value.length >= 5)
            value = value.slice(0, 5) + "." + value.slice(5, 9)
        input.value = value
    })

    originalDueDateInput?.addEventListener("input", (e) => {
        const input = e.target as HTMLInputElement
        let value = input.value.replace(/\D/g, "")
        if (value.length >= 2) value = value.slice(0, 2) + "." + value.slice(2)
        if (value.length >= 5)
            value = value.slice(0, 5) + "." + value.slice(5, 9)
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

        if (
            !birthDateInput?.value ||
            !/^\d{2}\.\d{2}\.\d{4}$/.test(birthDateInput.value)
        ) {
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
                        numberOfChildren: parseInt(
                            numChildrenInput?.value || "1"
                        ),
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

            // Show success message with download link
            if (successMessage) {
                successMessage.innerHTML = `
                    PDF erfolgreich erstellt! ✅<br><br>
                    <a href="${result.downloadUrl}"
                       target="_blank"
                       style="display: inline-block;
                              padding: 12px 24px;
                              background: #FB6A42;
                              color: white;
                              border-radius: 8px;
                              text-decoration: none;
                              font-weight: 600;
                              margin-top: 12px;
                              transition: background 0.2s;">
                        📥 PDF herunterladen
                    </a>
                `
                successMessage.classList.add("show")

                // Add hover effect to the link
                const downloadLink = successMessage.querySelector('a')
                if (downloadLink) {
                    downloadLink.addEventListener('mouseenter', () => {
                        downloadLink.style.background = '#E85A32'
                    })
                    downloadLink.addEventListener('mouseleave', () => {
                        downloadLink.style.background = '#FB6A42'
                    })
                }
            }

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
