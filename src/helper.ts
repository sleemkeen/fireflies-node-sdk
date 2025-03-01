export function generateGraphQLFilter(fields: string[]): string {
    return fields.join(" ");
}

// const fields = ["id", "dateString", "privacy", "speakers { id name }"];