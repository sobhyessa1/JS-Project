

//?-------      navbar

    // get pageName
  const currentPage = location.pathname.substring(1);
  
  const links = document.querySelectorAll("nav a");
  links.forEach(link => {
    if(link.getAttribute("href") === currentPage){
      link.classList.add("activeted");
    } else {
      link.classList.remove("activeted");
    }
  });
