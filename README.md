# Elterngeld PDF Filler - POC

API to automatically fill the Hamburg Elterngeld PDF form (Page 1 - Child Information).

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Easiest for Non-Devs)

1. **Create a Vercel Account** (if you don't have one)
   - Go to: https://vercel.com/signup
   - Sign up with GitHub, GitLab, or Bitbucket

2. **Push this code to GitHub**
   - Create a new repository on GitHub
   - Upload these files to the repository

3. **Import to Vercel**
   - Go to: https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repository
   - Click "Deploy"
   - Done! ✅

### Option 2: Deploy via Command Line

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project folder
cd elterngeld-api

# Install dependencies
npm install

# Deploy
vercel

# For production deployment
vercel --prod
```

---

## 📡 API Endpoint

Once deployed, your API will be available at:
```
https://your-project-name.vercel.app/api/fill-elterngeld
```

---

## 🔧 How to Use

### API Request

**Endpoint:** `POST /api/fill-elterngeld`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "childFirstName": "Emma",
  "childLastName": "Schmidt",
  "childBirthDate": "15.04.2025",
  "isPremature": false,
  "originalDueDate": "",
  "hasDisability": false,
  "numberOfChildren": 1
}
```

**Response:**
- Success: PDF file download (binary)
- Error: JSON with error message

---

## 📋 Field Mapping

| API Field | PDF Field | Description | Required |
|-----------|-----------|-------------|----------|
| `childFirstName` | `1a Vorname(n)` | Child's first name | Yes |
| `childLastName` | `1a Nachname` | Child's last name | Yes |
| `childBirthDate` | `1b Geburtsdatum Jahr` | Birth date (DD.MM.YYYY) | Yes |
| `numberOfChildren` | `1a Anzahl der Kinder` | Number of children (for twins+) | No |
| `isPremature` | `1b Frühgeboren` | Was born 6+ weeks early | No |
| `originalDueDate` | `1b Errechneter Geburtstermin Jahr` | Original due date | No |
| `hasDisability` | `1b Behinderung` | Has a disability | No |

---

## 🧪 Test with cURL

```bash
curl -X POST https://your-project-name.vercel.app/api/fill-elterngeld \
  -H "Content-Type: application/json" \
  -d '{
    "childFirstName": "Emma",
    "childLastName": "Schmidt",
    "childBirthDate": "15.04.2025",
    "isPremature": false,
    "hasDisability": false,
    "numberOfChildren": 1
  }' \
  --output elterngeld-filled.pdf
```

---

## 🔗 Voiceflow Integration

### Step 1: Create API Call Block in Voiceflow

1. Add an "API" block after collecting all child information
2. Configure the API call:
   - **Method**: POST
   - **URL**: `https://your-project-name.vercel.app/api/fill-elterngeld`
   - **Headers**: `Content-Type: application/json`
   - **Body**:
   ```json
   {
     "childFirstName": "{childFirstName}",
     "childLastName": "{childLastName}",
     "childBirthDate": "{childBirthDate}",
     "isPremature": "{isPremature}",
     "originalDueDate": "{originalDueDate}",
     "hasDisability": "{hasDisability}",
     "numberOfChildren": "{numberOfChildren}"
   }
   ```

### Step 2: Handle the Response

The API returns the filled PDF as a binary file. You can:

1. **Option A**: Save the PDF URL and send it to the user
   - Store the response in a variable
   - Display download link to user

2. **Option B**: Email the PDF to the user
   - Integrate with an email service
   - Attach the generated PDF

---

## 🛠️ Troubleshooting

### Error: "Failed to fetch PDF template"
- The Hamburg government website might be down
- Try again later or host the template PDF yourself

### Error: "Could not fill field"
- Check that field names match exactly
- Some fields might have slightly different names
- Check the console logs for details

### PDF is blank after generation
- Ensure data format matches (dates as DD.MM.YYYY)
- Check that field names are correct
- Try uncommenting `form.flatten()` to make fields visible

---

## 📦 Project Structure

```
elterngeld-api/
├── api/
│   └── fill-elterngeld.js   # Main API endpoint
├── package.json              # Dependencies
├── vercel.json              # Vercel configuration
└── README.md                # This file
```

---

## 🔐 Security Notes

- API is public by default
- Add authentication if needed (e.g., API keys)
- Consider rate limiting for production
- PDFs are generated on-demand (not stored)

---

## 🚧 Future Enhancements

- [ ] Add authentication
- [ ] Support for more pages
- [ ] Email delivery integration
- [ ] Field validation
- [ ] Error handling improvements
- [ ] PDF storage (optional)

---

## 📝 License

MIT

---

## 🆘 Support

Questions? Issues? Open a GitHub issue or contact support.
