import { Node } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-2";
import UploadNode from "./UploadNode";
import {
    parseFilterCrop,
    serializeFilterCrop,
    parseFilterRotate,
    serializeFilterRotate,
} from "sharp-files";


export const Upload = Node.create({
    name: 'upload',

    group: 'block',

    atom: true,

    isolating: true,

    priority: 150,

    defaultOptions: {
        fieldProps: {},
        isReady: () => true,
        getFile: () => {},
        registerFile: () => {},
        onInput: () => {},
        onRemove: () => {},
        onUpdate: () => {},
    },

    addAttributes() {
        return {
            disk: {
                default: null,
            },
            path: {
                default: null,
            },
            name: {
                default: null,
            },
            filters: {
                parseHTML: element => ({
                    crop: parseFilterCrop(element.getAttribute('filter-crop')),
                    rotate: parseFilterRotate(element.getAttribute('filter-rotate')),
                }),
                renderHTML: () => null,
            },
            'filter-crop': {
                default: null,
                renderHTML: attributes => ({
                    'filter-crop': serializeFilterCrop(attributes.filters?.crop),
                }),
            },
            'filter-rotate': {
                default: null,
                renderHTML: attributes => ({
                    'filter-rotate': serializeFilterRotate(attributes.filters?.rotate),
                }),
            },
            /**
             * @type File
             */
            file: {
                default: null,
                renderHTML: () => null,
            },
            isImage: {
                default: false,
                parseHTML: element => element.matches('x-sharp-image'),
                renderHTML: () => null,
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: 'x-sharp-image',
            },
            {
                tag: 'x-sharp-file',
            },
        ]
    },

    renderHTML({ node, HTMLAttributes }) {
        if(node.attrs.isImage) {
            return ['x-sharp-image', HTMLAttributes];
        }
        return ['x-sharp-file', HTMLAttributes];
    },

    addCommands() {
        return {
            insertUpload: attrs => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: {
                        file: attrs.file,
                        isImage: attrs.file.type.match(/^image\//),
                    },
                });
            },
            newUpload: () => ({ editor }) => {
                /**
                 * @see UploadFileInput
                 */
                editor.emit('new-upload');
            },
        }
    },

    addNodeView() {
        return VueNodeViewRenderer(UploadNode);
    },
});