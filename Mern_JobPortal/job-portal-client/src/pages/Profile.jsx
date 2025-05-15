import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import app from '../firebase/firebase.config';

const storage = getStorage(app);

const Profile = () => {
    const { user, updateUserProfile } = useContext(AuthContext);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };
    
    const handleUpload = async () => {
        if (!selectedFile) return;
        
        try {
            setLoading(true);
            
            // Créer une référence unique pour l'image
            const storageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}-${selectedFile.name}`);
            
            // Télécharger le fichier
            await uploadBytes(storageRef, selectedFile);
            
            // Obtenir l'URL de téléchargement
            const photoURL = await getDownloadURL(storageRef);
            
            // Mettre à jour le profil utilisateur
            await updateUserProfile({ photoURL });
            
            alert('Photo de profil mise à jour avec succès!');
            setSelectedFile(null);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la photo:', error);
            alert('Erreur lors de la mise à jour de la photo. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>
            
            <div className="mb-4 flex flex-col items-center">
                <img 
                    src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                    alt="Photo de profil" 
                    className="w-32 h-32 rounded-full mb-4 object-cover"
                />
                
                {user?.email && (
                    <p className="text-gray-700 mb-4">{user.email}</p>
                )}
            </div>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Changer la photo de profil</label>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue file:text-white
                        hover:file:bg-blue-700"
                />
            </div>
            
            <button 
                onClick={handleUpload} 
                disabled={!selectedFile || loading}
                className="bg-blue py-2 px-4 text-white rounded disabled:opacity-50"
            >
                {loading ? 'Mise à jour en cours...' : 'Mettre à jour la photo'}
            </button>
        </div>
    );
};

export default Profile;