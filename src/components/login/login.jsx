import React, { useEffect, useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGooglePlusG, faFacebookF, faGithub, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import 'react-phone-number-input/style.css';
import PhoneInput from "react-phone-number-input";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload"; // This is your custom upload function

const Login = () => {
  const [phoneNumber, setNumber] = useState('');
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  useEffect(() => {
    const loginbox = document.getElementById("loginbox");
    const registerbtn = document.getElementById("register");
    const loginbtn = document.getElementById("login");

    const addActiveClass = () => loginbox.classList.add("active");
    const removeActiveClass = () => loginbox.classList.remove("active");

    if (registerbtn && loginbtn) {
      registerbtn.addEventListener("click", addActiveClass);
      loginbtn.addEventListener("click", removeActiveClass);
    }

    return () => {
      if (registerbtn && loginbtn) {
        registerbtn.removeEventListener("click", addActiveClass);
        loginbtn.removeEventListener("click", removeActiveClass);
      }
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    toast.success("Registration successful, please verify your email.");

    const formdata = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formdata);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file);
      await sendEmailVerification(res.user);

      toast.info("Verification email sent. Please check your inbox.");

      const checkVerification = setInterval(async () => {
        await res.user.reload(); // Refresh user data
        if (res.user.emailVerified) {
          clearInterval(checkVerification); // Stop the interval

          await setDoc(doc(db, "users", res.user.uid), {
            username,
            email,
            avatar: imgUrl,
            mobile: phoneNumber,
            id: res.user.uid,
            blocked: [],
          });

          await setDoc(doc(db, "userchat", res.user.uid), {
            chats: [],
          });

          toast.success("Email verified and user data saved.");

          const loginbox = document.getElementById("loginbox");
          if (loginbox) {
            loginbox.classList.remove("active");
          }
          toast.info("Enter your details and Sign In");
        }
      }, 3000);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formdata = new FormData(e.target);
    const { email, password } = Object.fromEntries(formdata);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully signed in.");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };

  return (
    <div className="loginbox" id="loginbox">
      <div className="form-loginbox signup">
        <form onSubmit={handleRegister}>
          <h1>Create account</h1>
          <div className="social-icons">
            <a href="#" className="sicon"><FontAwesomeIcon icon={faGooglePlusG} /></a>
            <a href="#" className="sicon"><FontAwesomeIcon icon={faFacebookF} /></a>
            <a href="#" className="sicon"><FontAwesomeIcon icon={faGithub} /></a>
            <a href="#" className="sicon"><FontAwesomeIcon icon={faLinkedinIn} /></a>
          </div>

          <input type="text" placeholder="Name" name="username" required />
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="Avatar" />
            Upload Profile Picture
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
          <input type="email" placeholder="Email" name="email" required />
          <PhoneInput
            className="phonein"
            placeholder="Phone Number"
            defaultCountry="IN"
            name="mobile"
            value={phoneNumber}
            onChange={setNumber}
            required
          />
          <input type="password" placeholder="Password" name="password" required />
          <button>Sign Up</button>
        </form>
      </div>

      <div className="form-loginbox signin">
        <form onSubmit={handleLogin}>
          <h1>Sign In</h1>
          <div className="social-icons">
            <a href="#" className="sicon"><FontAwesomeIcon icon={faGooglePlusG} /></a>
            <a href="#" className="sicon"><FontAwesomeIcon icon={faFacebookF} /></a>
            <a href="#" className="sicon"><FontAwesomeIcon icon={faGithub} /></a>
            <a href="#" className="sicon"><FontAwesomeIcon icon={faLinkedinIn} /></a>
          </div>

          <input type="email" placeholder="Email" name="email" required />
          <input type="password" placeholder="Password" name="password" required />
          <a href="#">Forgot Password?</a>
          <button>Sign In</button>
        </form>
      </div>

      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all of the site features.</p>
            <button className="hidden" id="login">Sign In</button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Hello Friend!</h1>
            <p>Register with your personal details to use all of the site features.</p>
            <button className="hidden" id="register">Sign Up</button>
          </div>
        </div>
      </div>
    </div>
 

    );
};

export default Login;