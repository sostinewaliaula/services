import { Response } from 'express';

/**
 * Interface for MySQL/MariaDB error objects
 */
interface DBError extends Error {
    code?: string;
    errno?: number;
    sqlState?: string;
    sqlMessage?: string;
}

/**
 * Handles database errors and sends a consistent response to the client.
 * Specifically targets ER_DUP_ENTRY (1062) to provide user-friendly messages.
 * 
 * @param res Express Response object
 * @param error Error object caught from a database operation
 * @param entityName Friendly name of the entity (e.g., 'Category', 'Team')
 */
export const handleDBError = (res: Response, error: any, entityName: string) => {
    const dbError = error as DBError;

    // ER_DUP_ENTRY code is 1062 or 'ER_DUP_ENTRY'
    if (dbError.errno === 1062 || dbError.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            error: `${entityName} with this name already exists.`
        });
    }

    console.error(`Error in ${entityName} operation:`, error);
    return res.status(500).json({
        error: `An unexpected error occurred while processing the ${entityName.toLowerCase()}.`
    });
};
