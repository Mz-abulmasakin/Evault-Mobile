
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

  function goToLogin() {
    if (navigation?.replace) {
      navigation.replace("LoginScreen");
    } else if (navigation?.navigate) {
      navigation.navigate("LoginScreen");
    }
  }

  async function handleRegister() {
    if (
      !fullName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !password.trim()
    ) {
      showAlert(
        "Incomplete Details",
        "Please fill in all registration fields."
      );

      return;
    }

    try {
      setLoading(true);

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

      const message =
        "Congratulations! Your eVault account has been created successfully.\n\n" +
        "Please log in to continue. After logging in, submit your BVN or NIN " +
        "in your profile to proceed with creating your dedicated bank account.";

      if (Platform.OS === "web") {
        showAlert("Congratulations!", message);
        goToLogin();
      } else {
        Alert.alert(
          "Congratulations!",
          message,
          [
            {
              text: "Continue to Login",
              onPress: goToLogin,
            },
          ],
          {
            cancelable: false,
          }
        );
      }
    } catch (error) {
      console.error(
        "Registration Error:",
        error?.response?.data ||
          error?.message ||
          error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Registration failed. Please try again.";

      showAlert(
        "Registration Failed",
        message
      );
    } finally {
      setLoading(false);
    }
  }

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
