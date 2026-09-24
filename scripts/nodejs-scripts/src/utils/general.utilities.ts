class GeneralUtilities {
    sleep(ms: number) {
        return new Promise((r) => setTimeout(r, ms));
    }
}

export const generalUtilities = new GeneralUtilities();
