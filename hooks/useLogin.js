import {
    useState
} from "react";


import {
    login as loginService
} from "../services/authService";



export default function useLogin() {


    const [loading,setLoading] = useState(false);




    const login = async (
        identifier,
        password
    ) => {


        if(
            !identifier?.trim() ||
            !password?.trim()
        ){

            throw new Error(
                "Please enter your email/phone number and password."
            );

        }




        try {


            setLoading(true);



            const response =
            await loginService(
                identifier.trim(),
                password
            );



            return response;



        }
        catch(error){


            throw error;



        }
        finally{


            setLoading(false);


        }


    };




    return {

        login,

        loading

    };


}