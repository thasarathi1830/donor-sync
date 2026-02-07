// import Firestore & its functions
import { db } from "@/firebaseConfig";
import { doc, collection, addDoc, getDocs, getDoc, setDoc, updateDoc, query, where, deleteDoc } from "firebase/firestore";

// import current user context
import { } from "@/context/UserContext"

// func to generate random userId (my format) for new users.
function generateUserId(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const partLength = 4;
    const parts = 6;
    let userId: string[] = [];

    for (let i = 0; i < parts; i++) {
        let segment = "";
        for (let j = 0; j < partLength; j++) {
            segment += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        userId.push(segment);
    }

    return userId.join("-");
}

// func to login users to database.
export async function loginUserDatabase(role: string, loginId: string) {
    if (!db) {
        console.error("Firebase Firestore not initialized");
        return null;
    }

    try {
        let usersRef;
        let q;

        switch (role) {
            case "patient":
                usersRef = collection(db, "patients");
                q = query(usersRef, where("phone", "==", loginId.toLowerCase().trim()));
                break;
            case "donor":
                usersRef = collection(db, "donors");
                q = query(usersRef, where("phone", "==", loginId.toLowerCase().trim()));
                break;
            case "hospital":
                usersRef = collection(db, "hospitals");
                q = query(usersRef, where("email", "==", loginId.toLowerCase().trim()));
                break;
            case "organisation":
                usersRef = collection(db, "organisations");
                q = query(usersRef, where("email", "==", loginId.toLowerCase().trim()));
                break;
            default:
                console.error("Invalid role provided:", role);
                return null;
        }

        const querySnapshot = await getDocs(q);
        console.log("Firestore Query Result:", querySnapshot.docs.map(doc => doc.data()));

        // ✅ If User exists, return existing user data
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data() as Record<string, any>;
            console.log("User exists, returning data:", userData);
            return { userId: userDoc.id, ...userData };
        }

        // ❌ If User does NOT exist, create a new one
        const userId = generateUserId();
        const docRef = doc(db, role === "patient" ? "patients" : role === "donor" ? "donors" : role === "hospital" ? "hospitals" : "organisations", userId);

        const newUserData = {
            [role === "hospital" || role === "organisation" ? "email" : "phone"]: loginId.toLowerCase().trim(),
            onboarded: "no",
            createdAt: new Date(),
        };

        await setDoc(docRef, newUserData, { merge: true });

        console.log("New user created with ID:", userId);
        return { userId, ...newUserData };

    } catch (error) {
        console.error("Error handling user login:", error);
        return null;
    }
}

export async function getUserDataById(userId: string, role: string) {
    if (!db) {
        console.error("Firebase Firestore not initialized");
        return null;
    }

    // Role-specific fetching logic
    // (Refactored for brevity and clarity, although similar logic)
    const collectionName = role === "patient" ? "patients" :
        role === "donor" ? "donors" :
            role === "hospital" ? "hospitals" :
                role === "organisation" ? "organisations" : null;

    if (!collectionName) {
        console.error("Invalid role:", role);
        return null;
    }

    try {
        const docRef = doc(db, collectionName, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log(`${role} Data:`, docSnap.data());
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log(`No such ${role} found!`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching ${role}:`, error);
        return null;
    }
}

// func to update data of a user/collection in their role's doc
export async function updateUserData(role: string, userId: string, updateData: any) {
    if (!db) {
        console.error("Firebase Firestore not initialized");
        return { success: false, message: "Firebase Firestore not initialized" };
    }

    try {
        const userRef = doc(db, role, userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            await updateDoc(userRef, updateData);
        } else {
            await setDoc(userRef, updateData);
        }

        return { success: true, message: "User updated successfully" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}



export async function deleteUserById(userId: string, role: string) {
    if (!db) {
        console.error("Firebase Firestore not initialized");
        return null;
    }

    if (role == "patient") {
        try {
            const docRef = doc(db, "patients", userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Patient Data:", docSnap.data());
                // Deleting the patient document
                await deleteDoc(docRef);
                console.log("Patient document deleted.");
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                console.log("No such patient found!");
                return null;
            }
        } catch (error) {
            console.error("Error deleting patient:", error);
            return null;
        }
    }
    else if (role == "donor") {
        try {
            const docRef = doc(db, "donors", userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Donor Data:", docSnap.data());
                // Deleting the donor document
                await deleteDoc(docRef);
                console.log("Donor document deleted.");
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                console.log("No such Donor found!");
                return null;
            }
        } catch (error) {
            console.error("Error deleting Donor:", error);
            return null;
        }
    }
    else if (role == "hospital") {
        try {
            const docRef = doc(db, "hospitals", userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Hospital Data:", docSnap.data());
                // Deleting the hospital document
                await deleteDoc(docRef);
                console.log("Hospital document deleted.");
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                console.log("No such hospital found!");
                return null;
            }
        }
        catch (error) {
            console.error("Error deleting hospital:", error);
            return null;
        }
    }

    else if (role == "organisation") {
        try {
            const docRef = doc(db, "organisations", userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("organisation Data:", docSnap.data());
                // Deleting the organisation document
                await deleteDoc(docRef);
                console.log("organisation document deleted.");
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                console.log("No such organisation found!");
                return null;
            }
        }
        catch (error) {
            console.error("Error deleting organisation:", error);
            return null;
        }
    }
}