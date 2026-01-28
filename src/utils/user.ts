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
 * Extracts the full name (first and last) from a business email formatted as first.last@domain.com
 * and returns it with proper capitalization (e.g., "Robert Barron").
 */
export const extractAgentName = (email: string | null | undefined): string => {
    if (!email) return 'User';

    try {
        // Get the part before @
        const localPart = email.split('@')[0];
        // Split by dot to get name parts
        const nameParts = localPart.split('.');

        // Capitalize each part
        const capitalizedParts = nameParts.map(part =>
            part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        );

        // Join with space (e.g., "Robert Barron")
        return capitalizedParts.join(' ');
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

/**
 * Generates the staff name format used in the Scheduler (Firstname capitalized)
 * based on the user's email.
 */
export const getSchedulerStaffName = (email: string | null | undefined): string => {
    if (!email) return 'Unknown User';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
};
