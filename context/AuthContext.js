import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getToken,
    removeToken,
    saveToken,
} from "../storage/tokenStorage";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        restoreSession();
    }, []);

    const restoreSession = async () => {
        try {

            const storedToken = await getToken();

            if (storedToken) {
                setToken(storedToken);

                // Later we'll call GET /auth/me
                // to get the latest user details.

            }

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }
    };

    const login = async (jwt, loggedInUser) => {

        await saveToken(jwt);

        setToken(jwt);
        setUser(loggedInUser);

    };

    const logout = async () => {

        await removeToken();

        setToken(null);
        setUser(null);

    };

    return (

        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                setUser,
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}

export function useAuth() {
    return useContext(AuthContext);
}