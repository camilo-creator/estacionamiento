declare global {
  const firebase: {
    initializeApp: (config: any) => any;
    auth: () => any;
    firestore: () => any;
    firestore: {
      FieldValue: {
        serverTimestamp: () => any;
      };
    };
  };
}

export {};
