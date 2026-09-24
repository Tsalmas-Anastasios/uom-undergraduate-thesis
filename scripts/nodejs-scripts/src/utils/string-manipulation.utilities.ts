class StringManipulationUtilities {
    isEmail(text: string): boolean {
        const emailRegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,50}$/;
        return emailRegExp.test(text);
    }
}

export const stringManipulationUtilities = new StringManipulationUtilities();
