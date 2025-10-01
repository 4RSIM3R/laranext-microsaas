import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface EmbedModalProps {
    isOpen: boolean;
    onClose: () => void;
    embedUrl: string;
    embedCode: string;
    customEmbedUrl?: string;
    customEmbedCode?: string;
    cssTemplate?: string;
}

export default function EmbedModal({ isOpen, onClose, embedUrl, embedCode, customEmbedUrl, customEmbedCode, cssTemplate }: EmbedModalProps) {
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedCustomUrl, setCopiedCustomUrl] = useState(false);
    const [copiedCustomCode, setCopiedCustomCode] = useState(false);
    const [copiedCss, setCopiedCss] = useState(false);

    const copyToClipboard = async (text: string, type: 'url' | 'code' | 'custom-url' | 'custom-code' | 'css') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'url') {
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 2000);
            } else if (type === 'code') {
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
            } else if (type === 'custom-url') {
                setCopiedCustomUrl(true);
                setTimeout(() => setCopiedCustomUrl(false), 2000);
            } else if (type === 'custom-code') {
                setCopiedCustomCode(true);
                setTimeout(() => setCopiedCustomCode(false), 2000);
            } else if (type === 'css') {
                setCopiedCss(true);
                setTimeout(() => setCopiedCss(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Embed Form</DialogTitle>
                    <DialogDescription>Choose between a styled embed or a customizable CSS embed for your website.</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="standard" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="standard">Standard Embed</TabsTrigger>
                        <TabsTrigger value="custom">Custom CSS Embed</TabsTrigger>
                    </TabsList>

                    <TabsContent value="standard" className="space-y-6">
                        {/* Direct Link */}
                        <div className="space-y-2">
                            <Label htmlFor="embed-url">Direct Link</Label>
                            <div className="flex gap-2">
                                <Input id="embed-url" value={embedUrl} readOnly className="font-mono text-sm" />
                                <Button variant="outline" size="sm" onClick={() => copyToClipboard(embedUrl, 'url')} className="shrink-0">
                                    {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => window.open(embedUrl, '_blank')} className="shrink-0">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">Pre-styled form using shadcn/ui components</p>
                        </div>

                        {/* Embed Code */}
                        <div className="space-y-2">
                            <Label htmlFor="embed-code">Embed Code (iframe)</Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Textarea id="embed-code" value={embedCode} readOnly className="resize-none font-mono text-sm" rows={3} />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(embedCode, 'code')}
                                        className="shrink-0 self-start"
                                    >
                                        {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Copy and paste this HTML code into your website where you want the form to appear.
                                </p>
                            </div>
                        </div>

                        {/* Customization Options */}
                        <div className="space-y-2">
                            <Label>iframe Customization</Label>
                            <div className="space-y-2 rounded-lg bg-muted p-4">
                                <p className="text-sm font-medium">You can customize the iframe:</p>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    <li>
                                        • Change <code className="rounded bg-background px-1">width="100%"</code> to set a specific width
                                    </li>
                                    <li>
                                        • Change <code className="rounded bg-background px-1">height="600"</code> to adjust height
                                    </li>
                                    <li>
                                        • Add <code className="rounded bg-background px-1">style="border-radius: 8px;"</code> for rounded corners
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="custom" className="space-y-6">
                        {/* Custom Direct Link */}
                        <div className="space-y-2">
                            <Label htmlFor="custom-embed-url">Direct Link (Custom CSS)</Label>
                            <div className="flex gap-2">
                                <Input id="custom-embed-url" value={customEmbedUrl || ''} readOnly className="font-mono text-sm" />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(customEmbedUrl || '', 'custom-url')}
                                    className="shrink-0"
                                >
                                    {copiedCustomUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => window.open(customEmbedUrl, '_blank')} className="shrink-0">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">Plain HTML form with class/ID selectors for custom styling</p>
                        </div>

                        {/* Custom Embed Code */}
                        <div className="space-y-2">
                            <Label htmlFor="custom-embed-code">Embed Code (iframe)</Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Textarea
                                        id="custom-embed-code"
                                        value={customEmbedCode || ''}
                                        readOnly
                                        className="resize-none font-mono text-sm"
                                        rows={5}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(customEmbedCode || '', 'custom-code')}
                                        className="shrink-0 self-start"
                                    >
                                        {copiedCustomCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Use Option 1 for unstyled form, or Option 2 to load your custom CSS file via the{' '}
                                    <code className="rounded bg-muted px-1">css</code> parameter.
                                </p>
                            </div>
                        </div>

                        {/* CSS Template */}
                        {cssTemplate && (
                            <div className="space-y-2">
                                <Label htmlFor="css-template">CSS Template (Starter)</Label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Textarea
                                            id="css-template"
                                            value={cssTemplate}
                                            readOnly
                                            className="resize-none font-mono text-xs"
                                            rows={12}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(cssTemplate, 'css')}
                                            className="shrink-0 self-start"
                                        >
                                            {copiedCss ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <p className="font-medium">How to use:</p>
                                        <ol className="ml-4 list-decimal space-y-1">
                                            <li>Copy this CSS template</li>
                                            <li>Customize the styles to match your brand</li>
                                            <li>
                                                Save it as a CSS file (e.g., <code className="rounded bg-muted px-1">form-styles.css</code>)
                                            </li>
                                            <li>Host it on your website</li>
                                            <li>
                                                Use the iframe with <code className="rounded bg-muted px-1">?css=your-css-url</code> parameter
                                            </li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Available Selectors */}
                        <div className="space-y-2">
                            <Label>Available CSS Selectors</Label>
                            <div className="space-y-2 rounded-lg bg-muted p-4">
                                <p className="text-sm font-medium">Use these selectors to style the form:</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                                    <code>#form-container</code>
                                    <code>.form-card</code>
                                    <code>.form-input</code>
                                    <code>.form-textarea</code>
                                    <code>.form-select</code>
                                    <code>.form-btn-primary</code>
                                    <code>.form-label</code>
                                    <code>.form-error</code>
                                    <code>.form-help</code>
                                    <code>and many more...</code>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
