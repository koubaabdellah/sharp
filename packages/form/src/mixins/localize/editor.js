import localizeField from "./field";
import { localeObjectOrEmpty } from "../../util/locale";

/**
 * Can be used in Markdown, TrixEditor component
 */
export default function ({ textProp }) {
    return {
        _localizedEditor: { textProp },
        mixins: [localizeField],
        computed: {
            localizedText() {
                if (!this.value) {
                    return '';
                }

                return (
                    this.isLocalized
                    ? this.value[textProp] ? this.value[textProp][this.locale] : ''
                    : this.value[textProp]
                );
            }
        },

        methods: {
            localizedValue(text) {
                return {
                    ...this.value,
                    [textProp]: this.isLocalized
                        ? localeObjectOrEmpty({
                            localeObject: this.value ? this.value[textProp] : '',
                            locale: this.locale,
                            value: text
                        })
                        : text
                };
            }
        }
    }
}