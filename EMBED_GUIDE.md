# Form Embed Guide

This application provides two ways to embed forms on external websites:

## 1. Standard Embed (Pre-styled)

Uses shadcn/ui components with built-in styling. Perfect for quick deployment.

**URL Format:**

```
/embed/{embedCode}
```

**iframe Code:**

```html
<iframe src="https://your-domain.com/embed/ABC123" width="100%" height="600" frameborder="0"></iframe>
```

**Features:**

- Pre-styled with shadcn/ui components
- Responsive design
- Dark mode support
- No additional CSS needed

---

## 2. Custom CSS Embed (Bring Your Own Styles)

Renders plain HTML with semantic class names and IDs. Full control over styling.

**URL Format:**

```
/custom-embed/{embedCode}
/custom-embed/{embedCode}?css=https://your-site.com/custom-styles.css
```

**iframe Code (Unstyled):**

```html
<iframe src="https://your-domain.com/custom-embed/ABC123" width="100%" height="600" frameborder="0"></iframe>
```

**iframe Code (With Custom CSS):**

```html
<iframe
    src="https://your-domain.com/custom-embed/ABC123?css=https://your-site.com/form-styles.css"
    width="100%"
    height="600"
    frameborder="0"
></iframe>
```

### How to Use Custom CSS

1. **Copy the CSS Template** - Available in the embed modal under "Custom CSS Embed" tab
2. **Customize the Styles** - Modify colors, fonts, spacing to match your brand
3. **Host the CSS File** - Upload to your website (e.g., `https://your-site.com/form-styles.css`)
4. **Use the iframe with CSS parameter** - Add `?css=YOUR_CSS_URL` to the embed URL

### Available CSS Selectors

The custom embed uses semantic class names and IDs for easy styling:

#### Container & Layout

- `#form-container` - Main form wrapper
- `.form-card` - Form card container
- `.form-header` - Header section
- `.form-body` - Form body with fields
- `.form-footer` - Footer with navigation buttons

#### Form Elements

- `.form-group` - Field wrapper (e.g., `#form-group-email`)
- `.form-label` - Field labels (e.g., `#form-label-email`)
- `.form-input` - Text inputs
- `.form-textarea` - Textarea fields
- `.form-select` - Select dropdowns
- `.form-required` - Required field asterisk

#### Radio & Checkbox

- `.form-radio-group` - Radio button container
- `.form-radio-item` - Individual radio option
- `.form-radio-input` - Radio input element
- `.form-radio-label` - Radio label
- `.form-checkbox-group` - Checkbox container
- `.form-checkbox-item` - Individual checkbox option
- `.form-checkbox-input` - Checkbox input element
- `.form-checkbox-label` - Checkbox label

#### Password Fields

- `.form-password-wrapper` - Password field wrapper
- `.form-password-input` - Password input
- `.form-password-toggle` - Show/hide password button

#### Help & Errors

- `.form-help` - Help text (e.g., `#form-help-email`)
- `.form-error` - Error messages (e.g., `#form-error-email`)
- `.form-error-icon` - Error icon
- `.form-general-error` - General form errors

#### Progress & Navigation

- `.form-progress-badge` - Page indicator badge
- `.form-progress-container` - Progress bar container
- `.form-progress-bar` - Progress bar fill
- `.form-progress-text` - Progress percentage text

#### Buttons

- `.form-btn` - Base button class
- `.form-btn-primary` - Primary action button (Next/Submit)
- `.form-btn-secondary` - Secondary button (Previous)
- `#form-btn-next` - Next/Submit button
- `#form-btn-previous` - Previous button

#### Success State

- `.form-success` - Success message container
- `.form-success-icon` - Success checkmark icon
- `.form-success-title` - Success title
- `.form-success-message` - Success message text

#### Page Elements

- `#form-page-title` - Current page title
- `#form-page-description` - Current page description
- `.form-char-count` - Character counter for textareas

### CSS Template Structure

The provided CSS template includes:

- Reset styles for consistent rendering
- Form layout and spacing
- Input field styling
- Button styles
- Error and validation states
- Progress indicators
- Success page styling
- Responsive considerations

### Example Custom CSS

```css
/* Brand colors */
:root {
    --brand-primary: #4f46e5;
    --brand-error: #dc2626;
    --brand-success: #10b981;
}

/* Custom form styling */
#form-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
}

.form-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
}

.form-input,
.form-textarea,
.form-select {
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
    outline: none;
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-btn-primary {
    background: var(--brand-primary);
    color: white;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    border: none;
    cursor: pointer;
}

.form-btn-primary:hover {
    background: #4338ca;
}

.form-error {
    color: var(--brand-error);
    font-size: 0.875rem;
}
```

## Security Considerations

- The `?css` parameter only accepts HTTPS URLs for security
- External CSS files should be hosted on secure, trusted domains
- CSP headers may affect external CSS loading

## Best Practices

1. **Test Your Custom CSS** - Always preview the form with your custom styles before deploying
2. **Host CSS on CDN** - Use a CDN for better performance and caching
3. **Mobile Responsive** - Ensure your custom CSS works on all screen sizes
4. **Accessibility** - Maintain focus states and contrast ratios in your custom styles
5. **Version Control** - Version your CSS files to manage updates (e.g., `form-styles-v1.css`)

## Troubleshooting

**CSS Not Loading:**

- Verify the CSS URL is accessible (HTTPS required)
- Check browser console for CORS errors
- Ensure your CSS file has correct MIME type (`text/css`)

**Styling Issues:**

- Check CSS selector specificity
- Use browser dev tools to inspect applied styles
- Verify iframe dimensions are appropriate

**Form Not Submitting:**

- Check browser console for JavaScript errors
- Verify form is active in the dashboard
- Ensure network connectivity to the form API
