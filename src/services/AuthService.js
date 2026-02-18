import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithCredential,
    updateProfile,
    deleteUser as firebaseDeleteUser,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase.config';

class AuthService {
    async signUpWithEmail(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update profile with display name
            if (displayName) {
                await updateProfile(user, { displayName });
            }

            // Create user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: displayName || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            return user;
        } catch (error) {
            console.log('Error signing up:', error);
            throw this.handleAuthError(error);
        }
    }

    async signInWithEmail(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.log('Error signing in:', error);
            throw this.handleAuthError(error);
        }
    }

    async sendPasswordResetEmail(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return true;
        } catch (error) {
            console.log('Error sending password reset email:', error);
            throw this.handleAuthError(error);
        }
    }

    async signInWithGoogle(idToken) {
        try {
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;

            // Check if user document exists
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (!userDoc.exists()) {
                // Create user document for new Google users
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || '',
                    photoURL: user.photoURL || '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }

            return user;
        } catch (error) {
            console.log('Error signing in with Google:', error);
            throw this.handleAuthError(error);
        }
    }

    async updateUserProfile(updates) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user logged in');

            // Update Firebase Auth profile
            if (updates.displayName || updates.photoURL) {
                await updateProfile(user, {
                    displayName: updates.displayName,
                    photoURL: updates.photoURL,
                });
            }

            // Update Firestore document
            await setDoc(doc(db, 'users', user.uid), {
                ...updates,
                updatedAt: new Date().toISOString(),
            }, { merge: true });

            return true;
        } catch (error) {
            console.log('Error updating profile:', error);
            throw error;
        }
    }

    async getUserProfile(userId) {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));

            if (userDoc.exists()) {
                return userDoc.data();
            }

            return null;
        } catch (error) {
            console.log('Error getting user profile:', error);
            throw error;
        }
    }

    async deleteUserAccount() {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user logged in');

            // Delete user data from Firestore
            await deleteDoc(doc(db, 'users', user.uid));
            await deleteDoc(doc(db, 'favorites', user.uid));
            await deleteDoc(doc(db, 'projects', user.uid));

            // Delete Firebase Auth account
            await firebaseDeleteUser(user);

            return true;
        } catch (error) {
            console.log('Error deleting account:', error);
            throw error;
        }
    }

    handleAuthError(error) {
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered',
            'auth/invalid-email': 'Invalid email address',
            'auth/operation-not-allowed': 'Operation not allowed',
            'auth/weak-password': 'Password is too weak',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/invalid-credential': 'Invalid credentials',
        };

        return new Error(errorMessages[error.code] || 'Authentication failed');
    }
}

export default new AuthService();
