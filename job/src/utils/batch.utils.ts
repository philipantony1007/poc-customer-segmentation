export const flattenUserData = (users: { [key: string]: string[] }) => {
  return Object.entries(users).flatMap(([segment, emails]) =>
    emails.map((email) => ({ email, segment }))
  );
};

export const batchArray = <T>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
