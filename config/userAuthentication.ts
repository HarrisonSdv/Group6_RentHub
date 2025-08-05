import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { firebaseAuth } from "./FirebaseConfig";

export function userAuthentication() {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const userAuth = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(undefined);
      }
    });

    return userAuth;
  }, []);

  return {
    user,
  };
}
