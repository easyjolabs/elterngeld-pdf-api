# Elterngeld PDF Form - Integration Guide

## Step 1: Update Your Framer Component

### Replace the form extensions

In your Framer component, find this line:
```typescript
extensions: [
    createRegistrationForm(),
    createOnboardingForm(),
],
```

Replace it with:
```typescript
extensions: [
    createElterngeldForm(),
],
```

### Add the Elterngeld form function

Copy the entire `createElterngeldForm()` and `setupElterngeldForm()` functions from `elterngeld-form-component.tsx` and paste them **before** the line `export default function VoiceflowChat()`.

Place them right after the existing helper functions (after `setupMultiStepForm`).

---

## Step 2: Set Up Voiceflow Flow

### A. Create a Custom Response Block

1. In Voiceflow, add a new **Custom Response** block
2. Configure it:
   - **Type**: `Elterngeld_Form`
   - **Name**: `Elterngeld_Form`

### B. Create the Flow

Here's the recommended flow structure:

```
[Start]
   ↓
[Text Block]
"Ich helfe Ihnen, das Elterngeld-Formular auszufüllen."
   ↓
[Custom Response: Elterngeld_Form]
   ↓
[Capture Response]
Variable: {downloadUrl}
Path: payload.downloadUrl
   ↓
[Text Block with Button]
"Ihr Elterngeld-Formular ist fertig!"

[Button]
Text: "📥 PDF herunterladen"
URL: {downloadUrl}
Target: New Tab
```

### C. Alternative: Use Text Response

If you want to just send a text message with the link:

```
[Text Block]
"Hier ist Ihr ausgefülltes Elterngeld-Formular: {downloadUrl}"
```

---

## Step 3: Voiceflow Variable Setup

Create these variables in Voiceflow:

| Variable Name | Type | Description |
|--------------|------|-------------|
| `downloadUrl` | Text | The PDF download link |
| `filename` | Text | The PDF filename |
| `childFirstName` | Text | Child's first name (optional) |
| `childLastName` | Text | Child's last name (optional) |

---

## Step 4: Complete Updated Framer Component

Here's how your component should look (key sections):

```typescript
// ... [keep all the existing SHARED_FORM_STYLES] ...

// ============================================
// ELTERNGELD FORM
// ============================================

const createElterngeldForm = () => ({
    name: "ElterngeldForm",
    type: "response",
    match: ({ trace }: any) =>
        trace.type === "Elterngeld_Form" ||
        trace.payload?.name === "Elterngeld_Form",
    render: ({ element }: any) => {
        // ... [paste the entire render function from elterngeld-form-component.tsx]
    },
})

function setupElterngeldForm(wrapper: HTMLElement) {
    // ... [paste the entire function from elterngeld-form-component.tsx]
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function VoiceflowChat() {
    // ... [keep existing code] ...

    useEffect(() => {
        // ... [keep existing code until vf.chat.load] ...

        vf.chat
            .load({
                verify: { projectID: "69173e22a302c7cedb983faf" },
                url: "https://general-runtime.voiceflow.com",
                versionID: "production",
                voice: { url: "https://runtime-api.voiceflow.com" },
                render: {
                    mode: "embedded",
                    target: containerRef.current,
                },
                assistant: {
                    extensions: [
                        createElterngeldForm(), // ← Add this
                    ],
                    stylesheet: "https://easyjolabs.github.io/voiceflow-styles/voiceflow.css",
                },
            })
        // ... [rest of the code]
    }, [])

    // ... [rest of component]
}
```

---

## Step 5: Testing

### Test the Integration

1. **Deploy** your updated Framer component
2. In Voiceflow, **publish** your agent
3. **Test the flow**:
   - Trigger the Elterngeld form
   - Fill in the child information
   - Click submit
   - Verify you receive the download link

### Test Data

Use this sample data for testing:

```
First Name: Emma
Last Name: Schmidt
Birth Date: 15.04.2025
Number of Children: 1
Premature: No
Disability: No
```

---

## Step 6: Handling the Download Link in Voiceflow

### Option A: Button (Recommended)

```
[Text Block]
"Ihr Formular wurde erfolgreich erstellt!"

[Buttons Block]
Button 1:
  Text: "📥 PDF herunterladen"
  Action: Open URL
  URL: {downloadUrl}
  Open in: New Tab
```

### Option B: Direct Link

```
[Text Block]
"Hier ist Ihr Elterngeld-Formular:
[Download PDF]({downloadUrl})"
```

### Option C: Custom HTML (Advanced)

```html
<a href="{downloadUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background: #FB6A42; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
  📥 PDF herunterladen
</a>
```

---

## API Endpoint

The form calls:
```
POST https://elterngeld-pdf-api.vercel.app/api/fill-elterngeld
```

**Request Body:**
```json
{
  "childFirstName": "Emma",
  "childLastName": "Schmidt",
  "childBirthDate": "15.04.2025",
  "numberOfChildren": 1,
  "isPremature": false,
  "originalDueDate": "",
  "hasDisability": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "PDF generated successfully",
  "downloadUrl": "https://xxxxx.public.blob.vercel-storage.com/elterngeld-Schmidt-xxx.pdf",
  "filename": "elterngeld-Schmidt-xxx.pdf"
}
```

---

## Troubleshooting

### Form doesn't appear
- Check that the Custom Response type is exactly `Elterngeld_Form`
- Verify the extension is added to the `extensions` array
- Check browser console for errors

### API call fails
- Verify the API endpoint is correct
- Check Vercel Blob storage is set up
- Look at Vercel function logs for errors

### Download link doesn't work
- Ensure Blob storage is public
- Check that `downloadUrl` variable is captured correctly
- Verify the URL is valid in the response

---

## Complete Flow Example

Here's a full conversation flow:

1. **User**: "I need help with Elterngeld"
2. **Bot**: "I can help you fill out the Elterngeld form. Let's start!"
3. **Bot**: [Shows Elterngeld_Form custom response]
4. **User**: [Fills out form and submits]
5. **Bot**: "Perfect! Your PDF is ready. Here's your download link: [Button]"

---

## Next Steps

- Customize the success message
- Add error handling in Voiceflow
- Create follow-up flows (email the PDF, save to database, etc.)
- Add analytics tracking

---

## Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Verify Voiceflow variable mapping
3. Test the API directly: https://elterngeld-pdf-api.vercel.app/test.html
