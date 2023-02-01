import { allowedAttrs, allowedEls } from "src/modules/constants"
import { SvEl, KeyVal } from "src/models/models"
import { ref } from "vue"
import { StorageM } from "./storage_m"
import { CsSvgParser } from "./csSvgParser"

export abstract class SvElM {
    private static _svgString = ref('')
    public static get svgString() { return this._svgString.value }
    public static set svgString(value) { this._svgString.value = value }

    // public static lastRootSvEl = ref<SvEl>({} as SvEl)

    private static _rootSvEl = ref<SvEl>({} as SvEl)
    // public static get rootSvElRef() { return this._rootSvEl }
    public static get rootSvElRef() { return this._rootSvEl }
    public static get rootSvEl() { return this._rootSvEl.value }
    public static set rootSvEl(value) { this._rootSvEl.value = value }

    static async getSvElById(svEl: SvEl, id: string): Promise<SvEl | void> {
        if (svEl.id == id) { return svEl }
        let result
        for (let i = 0; result == null && i < svEl.children?.length!; i++)
            if (svEl.children && svEl.children.length > 0) {
                const child = svEl.children[i]
                if (child) result = await this.getSvElById(child, id)
                if (result) return result
            }
    }

    // static async updateAttrs(svEl: SvEl, el: Element) {
    //     svEl.attrs = SvElM.getAttrsArray(el)
    // }

    static async getSvEls(el: Element, compareAndRecord: boolean = false): Promise<SvEl> {
        let _svEl: SvEl = {} as SvEl
        const uncollapsed = StorageM.getUncollapsed()
        const showAttrs = StorageM.getShowAttrs()

        return await this.getSvElsLoop(el, 0, _svEl, uncollapsed, showAttrs, compareAndRecord)
    }

    static async getSvElsLoop(el: Element, depth: number = 0, _svEl: SvEl, uncollapsed: any, showAttrs: any, compareAndRecord: boolean): Promise<SvEl> {

        let children: SvEl[] = []
        Array.from(el.children)?.forEach(async (child) =>
            allowedEls.includes(child.tagName) ? children.push(await this.getSvElsLoop(child, depth + 1, _svEl, uncollapsed, showAttrs, compareAndRecord)) : '')

        _svEl = {
            attrs: await CsSvgParser.getAttrsFromInkscapeToInka(el as SVGElement, compareAndRecord),
            children: children,
            id: el.id,
            // isSelected: isSelected[el.id] ?? false,
            isUncollapsed: uncollapsed[el.id],
            showAttrs: showAttrs[el.id],
            name: el.getAttribute('inkscape:label') ?? el.id,
            tagName: el.tagName,
            depth: depth,
            kfs: StorageM.getKfs(el.id),
        }
        return _svEl
    }
}