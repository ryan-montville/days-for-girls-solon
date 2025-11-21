import{i as g,c as o,a as l}from"./app-DZzLD5eE.js";let u=document.getElementById("mailing-list-form");function p(){o();let a=new FormData(u),e={fullName:"",email:"",volunteerType:""},r=a.get("fullName");if(r===null||r.toString().trim()===""){l("Please enter your name","main-message","error");return}else if(r.toString().split(" ").length<2){l("Please enter your first and last name","main-message","error");return}else e.fullName=r.toString();let i=a.get("email");if(i===null||i.toString().trim()===""){l("Please enter your email","main-message","error");return}else e.email=i.toString();let n=a.get("phoneNumber");if(n!==null&&n.toString().replace(/\D/g,"")!==""){let t=parseInt(n.toString().replace(/\D/g,""));if(isNaN(t)){l("Please enter a valid phone number","main-message","error");return}else{let m=String(Math.abs(t)).length;if(m<10||m>11){l("Please enter a valid phone number","main-message","error");return}else e.phone=+n.toString().replace(/\D/g,"")}}let s=a.get("volunteerType");if(s===null){l("Please select what kind of emails you would like to receive","main-message","error");return}else e.volunteerType=s.toString();if(e.phone){let t=`This form does not currently send this data anywhere
Name: ${e.fullName}
Email: ${e.email}
Phone: ${e.phone}
Type: ${e.volunteerType}`;alert(t)}else{let t=`This form does not currently send this data anywhere
Name: ${e.fullName}
Email: ${e.email}
Type: ${e.volunteerType}`;alert(t)}}g("Mailing List");u.addEventListener("submit",a=>{a.preventDefault(),o(),p()});
