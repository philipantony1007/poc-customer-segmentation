export const batchArray = <T>(arr: T[], batchSize: number): T[][] => {
    return Array.from({ length: Math.ceil(arr.length / batchSize) }, (_, i) => 
      arr.slice(i * batchSize, i * batchSize + batchSize)
    );
  };