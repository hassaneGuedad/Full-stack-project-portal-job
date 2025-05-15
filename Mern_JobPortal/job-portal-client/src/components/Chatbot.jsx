import { useState, useEffect, useRef } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Ajout de l'état pour les suggestions
  const [suggestions, setSuggestions] = useState([
    "Comment créer un CV avec l'IA ?",
    "Comment postuler à une offre d'emploi ?",
    "Comment publier une offre d'emploi ?"
  ]);

  // Fonction pour gérer les suggestions cliquées
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    handleSubmit({ preventDefault: () => {} });
  };
  
  // Scroll automatique vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Message de bienvenue initial
  useEffect(() => {
    setMessages([
      {
        text: "Bonjour ! Je suis l'assistant de JobPortal. Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur les offres d'emploi, la création de CV, ou l'utilisation de notre plateforme.",
        sender: "bot",
      },
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage = { text: inputValue, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Appel à l'API du chatbot
      const response = await fetch("http://localhost:3003/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error("Erreur de communication avec le serveur");
      }

      const data = await response.json();
      
      // Ajouter la réponse du bot
      setMessages((prev) => [...prev, { text: data.response, sender: "bot" }]);
    } catch (error) {
      console.error("Erreur:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Bouton pour ouvrir/fermer le chatbot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center w-14 h-14"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Fenêtre du chatbot */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
          {/* En-tête */}
          <div className="bg-purple-600 text-white p-4">
            <h3 className="font-medium">Assistant JobPortal</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 ${msg.sender === "user" ? "text-right" : ""}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${msg.sender === "user" ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-800"}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-gray-200 rounded-full h-3 w-3 animate-bounce"></div>
                <div className="bg-gray-200 rounded-full h-3 w-3 animate-bounce delay-100"></div>
                <div className="bg-gray-200 rounded-full h-3 w-3 animate-bounce delay-200"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire de saisie */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 flex flex-col">
            {/* Suggestions de questions */}
            {messages.length <= 2 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Questions suggérées :</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Posez votre question..."
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
                disabled={isLoading || !inputValue.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Informations de contact */}
            <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
              <p className="font-medium mb-1">Nous contacter :</p>
              <p>Téléphone : <a href="tel:0657973118" className="text-purple-600 hover:underline">0657973118</a></p>
              <p>Email : <a href="mailto:emsigroupeE@gmail.com" className="text-purple-600 hover:underline">emsigroupeE@gmail.com</a></p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;