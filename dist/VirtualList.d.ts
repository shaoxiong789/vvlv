import { Vue } from 'vue-property-decorator';
import { VNode, CreateElement } from 'vue';
interface IVirtualListOptions {
    height: number;
    spare: number;
    resize?: boolean;
}
export default class VirtualList extends Vue {
    list: Array<any>;
    options: IVirtualListOptions;
    viewlist: Array<any>;
    scrollHeight: number;
    /**
     * 容器高度变化的流
     *
     * @private
     * @memberof VirtualList
     */
    private containerHeight$;
    private list$;
    private subscription;
    private virtualListRef;
    private stateDataSnapshot;
    private lastFirstIndex;
    private actualRowsSnapshot;
    listChange(): void;
    mounted(): void;
    private getDifferenceIndexes;
    render(h: CreateElement): VNode;
}
export {};
