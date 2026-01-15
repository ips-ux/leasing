/**
 * Extracts the first name from a business email formatted as first.last@domain.com
 * and returns it with proper capitalization.
 */
export const extractFirstName = (email: string | null | undefined): string => {
    if (!email) return 'User';

    try {
        // Get the part before @
        const localPart = email.split('@')[0];
        // Get the first part before the dot
        const firstName = localPart.split('.')[0];

        // Capitalize first letter
        return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    } catch (error) {
        return 'User';
    }
};

/**
 * Capitalizes each word in a string
 */
export const capitalize = (str: string): string => {
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};
