// hooks/useProfile.js

import {
  useState
} from "react";

import {
  useAuth
} from "../context/AuthContext";



export function useProfile(){


    const {
        user,
        setUser
    } = useAuth();



    const [
        isSaving,
        setIsSaving
    ] = useState(false);





    const updateProfile = async(
        updatedFields
    )=>{


        try{


            setIsSaving(true);



            /*
              Later this becomes:

              await api.put(
                 "/users/profile",
                 updatedFields
              );

            */



            const updatedUser = {

                ...user,

                ...updatedFields

            };



            setUser(updatedUser);



            return {

                success:true,

                user:updatedUser

            };



        }
        catch(error){


            console.log(
                "Profile update error:",
                error
            );


            return {

                success:false,

                error:error.message

            };


        }
        finally{


            setIsSaving(false);


        }


    };






    return {


        profileData:user,

        isLoading:false,

        isSaving,

        updateProfile


    };

    
}