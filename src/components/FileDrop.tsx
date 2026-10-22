import { useState, type ChangeEvent, type DragEvent } from 'react';

interface FileDropProps {
  onFile: (file: File) => void;
  /** Mniejsza wersja wyświetlana nad wczytanym raportem. */
  compact?: boolean;
}

export function FileDrop({ onFile, compact = false }: FileDropProps) {
  const [dragging, setDragging] = useState(false);

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    setDragging(true);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    // Przy kilku upuszczonych plikach bierzemy pierwszy.
    const file = event.dataTransfer.files[0];
    if (file) onFile(file);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onFile(file);
    // Pozwala wybrać ten sam plik ponownie.
    event.target.value = '';
  }

  const className = ['file-drop', compact && 'file-drop--compact', dragging && 'file-drop--dragging']
    .filter(Boolean)
    .join(' ');

  return (
    <label
      className={className}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input type="file" accept=".json,application/json" onChange={handleChange} />
      {compact ? (
        <span>Upuść inny raport albo kliknij, aby wybrać plik</span>
      ) : (
        <>
          <strong>Upuść tutaj plik raportu JSON ze Strykera</strong>
          <span>albo kliknij, aby wybrać plik z dysku</span>
          <span className="muted">Plik jest analizowany wyłącznie w przeglądarce.</span>
        </>
      )}
    </label>
  );
}
