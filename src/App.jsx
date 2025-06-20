import React, { useState, useCallback } from 'react';
import { Download, UploadCloud, FileText } from 'lucide-react';

// Componente principal do aplicativo
const App = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  // Lida com a seleção de arquivos pelo usuário
  const handleFileChange = useCallback((event) => {
    const files = Array.from(event.target.files).filter(file => file.type === 'application/pdf');
    setSelectedFiles(files);
    setMessage(files.length > 0 ? `${files.length} arquivo(s) PDF selecionado(s).` : '');
    setDownloadUrl(null);
    setError(null);
  }, []);

  // Lida com o processo de mesclagem de PDFs
  const handleMergePdfs = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setError('Por favor, selecione pelo menos um arquivo PDF para mesclar.');
      return;
    }

    setIsLoading(true);
    setMessage('Mesclando PDFs...');
    setError(null);
    setDownloadUrl(null);

    try {
      const { PDFDocument } = window.PDFLib;
      const mergedPdf = await PDFDocument.create();

      for (const file of selectedFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setMessage('PDFs mesclados com sucesso! Clique para baixar.');
    } catch (err) {
      console.error('Erro ao mesclar PDFs:', err);
      setError(`Ocorreu um erro ao mesclar os PDFs: ${err.message}. Certifique-se de que os arquivos não estão corrompidos ou protegidos.`);
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFiles]);

  // Função para limpar a seleção de arquivos e o estado
  const handleClear = useCallback(() => {
    setSelectedFiles([]);
    setMessage('');
    setDownloadUrl(null);
    setError(null);
  }, []);

  return (
      // Container principal da aplicação
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center p-4 font-inter">
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/pdf-lib/dist/pdf-lib.min.js"></script>

        <style>
          {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        .font-inter {
            font-family: 'Inter', sans-serif;
        }
        `}
        </style>

        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg text-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
            <FileText className="w-8 h-8 text-indigo-600" />
            Mesclar PDFs
          </h1>
          <p className="text-gray-600 mb-6">
            Selecione múltiplos arquivos PDF para mesclar em um único documento.
          </p>

          {/*  upload de arquivos */}
          <div className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-indigo-400 transition-colors duration-200">
            <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                className="hidden" // esconder o input de arquivo padrão
            />
            <label
                htmlFor="pdf-upload"
                className="cursor-pointer bg-indigo-500 text-white py-3 px-6 rounded-full font-semibold shadow-md hover:bg-indigo-600 transition-colors duration-200 flex items-center gap-2"
            >
              <UploadCloud className="w-5 h-5" />
              Selecionar PDFs
            </label>
            {selectedFiles.length > 0 && (
                <p className="mt-4 text-gray-700 text-sm">
                  {selectedFiles.length} arquivo(s) selecionado(s)
                  <button
                      onClick={handleClear}
                      className="ml-2 text-red-500 hover:text-red-700 font-medium"
                  >
                    (Limpar)
                  </button>
                </p>
            )}
          </div>

          {/* Lista de arquivos selecionados */}
          {selectedFiles.length > 0 && (
              <div className="mb-6 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50 text-left">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Arquivos para mesclar:</h3>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  {selectedFiles.map((file, index) => (
                      <li key={index} className="truncate">{file.name}</li>
                  ))}
                </ul>
              </div>
          )}

          {/* Botão de mesclagem */}
          <button
              onClick={handleMergePdfs}
              disabled={selectedFiles.length === 0 || isLoading}
              className={`w-full py-3 rounded-full font-bold text-white transition-all duration-300 ease-in-out
            ${selectedFiles.length === 0 || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              } flex items-center justify-center gap-2`}
          >
            {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mesclando...
                </>
            ) : (
                'Mesclar PDFs'
            )}
          </button>

          {/* Mensagens de feedback */}
          {message && !error && (
              <p className="mt-4 text-green-600 text-sm font-medium">{message}</p>
          )}
          {error && (
              <p className="mt-4 text-red-600 text-sm font-medium">{error}</p>
          )}

          {/* Link para download do PDF mesclado */}
          {downloadUrl && (
              <a
                  href={downloadUrl}
                  download="merged.pdf"
                  className="mt-6 inline-flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-6 rounded-full font-semibold shadow-lg hover:bg-blue-600 transition-colors duration-200 transform hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
                Baixar PDF Mesclado
              </a>
          )}
        </div>
      </div>
  );
};

export default App;
