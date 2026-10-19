
import { useState } from "react";
import { Alert, Platform } from "react-native";
import { register } from "../services/authService";


export function showAlert(title, message) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}


export default function useRegister(navigation) {

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);


  const handleRegister = async () => {

    /**
     * Validate form
     */
    if (
      !fullName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !password.trim()
    ) {
      showAlert(
        "Validation",
        "Please fill in all fields."
      );

      return;
    }


    try {

      setLoading(true);


      /**
       * Register user
       */
      const response = await register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
      });


      console.log(
        "Registration Response:",
        response
      );


      showAlert(
        "Registration Successful",
        "Your account has been created successfully. Please log in to continue."
      );


      /**
       * Go to login
       */
      if (navigation?.replace) {

        navigation.replace("LoginScreen");

      } else if (navigation?.navigate) {

        navigation.navigate("LoginScreen");

      }


    } catch (error) {

      console.log(
        "Registration Error:",
        error.response?.data || error.message
      );


      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";


      showAlert(
        "Registration Failed",
        message
      );


    } finally {

      setLoading(false);

    }

  };


  return {

    username,
    setUsername,

    fullName,
    setFullName,

    password,
    setPassword,

    email,
    setEmail,

    phoneNumber,
    setPhoneNumber,

    loading,

    handleRegister,

  };

}

