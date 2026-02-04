import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Modal } from './Modal';
import { Button } from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBold,
    faItalic,
    faListUl,
    faListOl,
    faHighlighter,
    faCode
} from '@fortawesome/free-solid-svg-icons';
import { getAllTemplates, saveTemplate, type EmailTemplate, type TemplateId } from '../../services/templateService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface TemplateEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TemplateEditorModal = ({ isOpen, onClose }: TemplateEditorModalProps) => {
    const { user } = useAuth();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>('request-income');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4 bg-white rounded-neuro-md',
            },
        },
    });

    // Load templates on mount
    useEffect(() => {
        if (isOpen) {
            loadTemplates();
        }
    }, [isOpen]);

    // Update editor content when selected template changes
    useEffect(() => {
        if (editor && templates.length > 0) {
            const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
            if (selectedTemplate) {
                editor.commands.setContent(selectedTemplate.content);
            }
        }
    }, [selectedTemplateId, templates, editor]);

    const loadTemplates = async () => {
        setIsLoading(true);
        try {
            const fetchedTemplates = await getAllTemplates();
            setTemplates(fetchedTemplates);
        } catch (error) {
            console.error('Error loading templates:', error);
            toast.error('Failed to load templates');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editor || !user?.email) return;

        setIsSaving(true);
        try {
            const content = editor.getHTML();
            await saveTemplate(selectedTemplateId, content, user.email);

            // Reload templates to get updated data
            await loadTemplates();

            toast.success('Template saved successfully!');
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error('Failed to save template');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (editor) {
            editor.commands.clearContent();
        }
        onClose();
    };

    if (!editor) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Email Templates">
            <div className="flex flex-col gap-4">
                {/* Template Selector */}
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-black/70">Template:</label>
                    <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value as TemplateId)}
                        className="flex-1 px-4 py-2 rounded-neuro-md bg-neuro-base shadow-neuro-inset border border-black/10 focus:outline-none focus:ring-2 focus:ring-neuro-secondary"
                        disabled={isLoading}
                    >
                        <option value="request-income">Request Income Email</option>
                        <option value="application-approved">Application Approved Email</option>
                        <option value="final-steps">Final Steps Email</option>
                    </select>
                </div>

                {/* Editor Toolbar */}
                <div className="flex flex-wrap gap-2 p-3 bg-neuro-base rounded-neuro-md shadow-neuro-raised border border-white/60">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`px-3 py-2 rounded-neuro-sm transition-all ${editor.isActive('bold')
                            ? 'bg-neuro-secondary text-white shadow-neuro-inset'
                            : 'bg-white shadow-neuro-raised hover:shadow-neuro-inset'
                            }`}
                        title="Bold"
                    >
                        <FontAwesomeIcon icon={faBold} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`px-3 py-2 rounded-neuro-sm transition-all ${editor.isActive('italic')
                            ? 'bg-neuro-secondary text-white shadow-neuro-inset'
                            : 'bg-white shadow-neuro-raised hover:shadow-neuro-inset'
                            }`}
                        title="Italic"
                    >
                        <FontAwesomeIcon icon={faItalic} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffff00' }).run()}
                        className={`px-3 py-2 rounded-neuro-sm transition-all ${editor.isActive('highlight')
                            ? 'bg-yellow-300 shadow-neuro-inset'
                            : 'bg-white shadow-neuro-raised hover:shadow-neuro-inset'
                            }`}
                        title="Highlight"
                    >
                        <FontAwesomeIcon icon={faHighlighter} />
                    </button>
                    <div className="w-px h-8 bg-black/10 mx-1" />
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`px-3 py-2 rounded-neuro-sm transition-all ${editor.isActive('bulletList')
                            ? 'bg-neuro-secondary text-white shadow-neuro-inset'
                            : 'bg-white shadow-neuro-raised hover:shadow-neuro-inset'
                            }`}
                        title="Bullet List"
                    >
                        <FontAwesomeIcon icon={faListUl} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`px-3 py-2 rounded-neuro-sm transition-all ${editor.isActive('orderedList')
                            ? 'bg-neuro-secondary text-white shadow-neuro-inset'
                            : 'bg-white shadow-neuro-raised hover:shadow-neuro-inset'
                            }`}
                        title="Numbered List"
                    >
                        <FontAwesomeIcon icon={faListOl} />
                    </button>
                    <div className="w-px h-8 bg-black/10 mx-1" />
                    <button
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={`px-3 py-2 rounded-neuro-sm transition-all ${editor.isActive('codeBlock')
                            ? 'bg-neuro-secondary text-white shadow-neuro-inset'
                            : 'bg-white shadow-neuro-raised hover:shadow-neuro-inset'
                            }`}
                        title="Code Block"
                    >
                        <FontAwesomeIcon icon={faCode} />
                    </button>
                </div>

                {/* Editor Content */}
                <div className="border-2 border-black/10 rounded-neuro-lg shadow-neuro-inset overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[400px] text-black/40">
                            Loading template...
                        </div>
                    ) : (
                        <EditorContent editor={editor} />
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-2">
                    <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={isLoading || isSaving}>
                        {isSaving ? 'Saving...' : 'Save Template'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
