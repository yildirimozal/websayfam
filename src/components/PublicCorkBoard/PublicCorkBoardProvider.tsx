'use client';

// ... (önceki importlar aynı)

const PublicCorkBoardProvider: React.FC<PublicCorkBoardProviderProps> = ({ children }) => {
  // ... (önceki state tanımlamaları aynı)

  const handleDeleteNote = useCallback(async (noteId: string) => {
    if (!session?.user || !noteId) {
      console.error('Silme işlemi için geçerli bir not ID\'si ve oturum gerekli');
      return;
    }

    try {
      const response = await fetch(`/api/public-notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Not silinirken hata oluştu');
      }

      // Başarılı silme işleminden sonra notları güncelle
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Not silinirken beklenmeyen bir hata oluştu');
      }
      console.error('Not silme hatası:', error);
    }
  }, [session]);

  // ... (diğer fonksiyonlar aynı)

  const contextValue: PublicCorkBoardContextType = {
    // ... (diğer context değerleri aynı)
    handleDeleteNote,
  };

  return (
    <PublicCorkBoardContext.Provider value={contextValue}>
      {children}
    </PublicCorkBoardContext.Provider>
  );
};

export default PublicCorkBoardProvider;
