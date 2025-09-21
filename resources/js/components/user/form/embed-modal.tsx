import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface EmbedModalProps {
    isOpen: boolean;
    onClose: () => void;
    embedUrl: string;
    embedCode: string;
}

export default function EmbedModal({ isOpen, onClose, embedUrl, embedCode }: EmbedModalProps) {
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    const copyToClipboard = async (text: string, type: 'url' | 'code') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'url') {
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 2000);
            } else {
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Embed Form</DialogTitle>
                    <DialogDescription>Use the embed code below to add this form to your website, or share the direct link.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
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
                        <p className="text-sm text-muted-foreground">Share this link directly or open it in a new tab to test the form.</p>
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
                        <Label>Customization Options</Label>
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
                                <li>
                                    • Remove <code className="rounded bg-background px-1">frameborder="0"</code> to show a border
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
