const card1 = document.getElementById("card1");
const card2 = document.getElementById("card2");
const signup = document.getElementById("signup");
const signin = document.getElementById("signin");
const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");

btn1.addEventListener("click" ,()=>{
    card1.classList.add("test1");
    card2.style.zIndex="1";
    signup.style.zIndex="-1";
    card1.style.zIndex="-1";
    card2.classList.add("test1");
    signup.style.opacity="0";
    signin.style.opacity="1";
    card1.style.borderTopLeftRadius="0"
    card1.style.borderBottomLeftRadius="0";
    card1.style.borderTopRightRadius="10px";
    card1.style.borderBottomRightRadius="10px";
    signin.style.borderTopRightRadius="0";
    signin.style.borderBottomRightRadius="0";
    signin.style.zIndex="1";
    signup.classList.add("test2");
    signin.classList.remove("test1");
});
btn2.addEventListener("click",()=>{
    card2.classList.remove("test1");
    card2.style.zIndex="-1";
    card1.classList.remove("test1");
    card1.style.zIndex="1";
    signin.style.opacity="0";
    signup.style.opacity="1";
    card1.style.borderTopLeftRadius="10px"
    card1.style.borderBottomLeftRadius="10px";
    card1.style.borderTopRightRadius="0"
    card1.style.borderBottomRightRadius="0";
    signup.style.zIndex="1";
    signin.classList.add("test1");
    signup.classList.remove("test2");
});
