export declare class MatTreeHarness extends ComponentHarness {
    getNodes(filter?: TreeNodeHarnessFilters): Promise<MatTreeNodeHarness[]>;
    getTreeStructure(): Promise<TextTree>;
    static hostSelector: string;
    static with(options?: TreeHarnessFilters): HarnessPredicate<MatTreeHarness>;
}

export declare class MatTreeNodeHarness extends ContentContainerComponentHarness<string> {
    _toggle: import("@angular/cdk/testing").AsyncFactoryFn<import("@angular/cdk/testing").TestElement | null>;
    collapse(): Promise<void>;
    expand(): Promise<void>;
    getLevel(): Promise<number>;
    getText(): Promise<string>;
    isDisabled(): Promise<boolean>;
    isExpanded(): Promise<boolean>;
    toggle(): Promise<void>;
    static hostSelector: string;
    static with(options?: TreeNodeHarnessFilters): HarnessPredicate<MatTreeNodeHarness>;
}

export declare type TextTree = {
    text?: string;
    children?: TextTree[];
};

export interface TreeHarnessFilters extends BaseHarnessFilters {
}

export interface TreeNodeHarnessFilters extends BaseHarnessFilters {
    disabled?: boolean;
    expanded?: boolean;
    level?: number;
    text?: string | RegExp;
}
