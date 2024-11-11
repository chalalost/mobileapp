import { useScreenDimensions } from "./useScreenRotaion";

export enum Breakpoint {
    SMALL = "small",
    MEDIUM = "medium",
    LARGE = "large"
}

// Determine if the current screen width should match the Small, Medium, or Large breakpoint.
export function useBreakpoint(): Breakpoint {
    const { width } = useScreenDimensions();

    if (width < 500) {
        return Breakpoint.SMALL;
    } else if (width >= 500 && width < 1000) {
        return Breakpoint.MEDIUM;
    } else {
        return Breakpoint.LARGE;
    }
}