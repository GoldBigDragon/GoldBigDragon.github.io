window.addEventListener('DOMContentLoaded', event => {
    const navbarShrink = function() {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }
    };
    navbarShrink();
    document.addEventListener('scroll', navbarShrink);
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function(responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });
});

function checkLanguage(){
	let nowLang = getCookie("lang");
	const languageElement = document.getElementById("language");
	if(nowLang == "ko") {
		languageElement.src= "/resources/img/header/lang/ko.png";
	} else if(nowLang == "jp") {
		languageElement.src= "/resources/img/header/lang/jp.png";
	} else if(nowLang == "cn") {
		languageElement.src= "/resources/img/header/lang/cn.png";
	} else if(nowLang == "ru") {
		languageElement.src= "/resources/img/header/lang/ru.png";
	} else {
		setCookie("lang", "en", 31);
		languageElement.src= "/resources/img/header/lang/en.png";
	}
}

function changeLanguage() {
	NOW_LANG = getCookie("lang");
	const languageElement = document.getElementById("language");
	if(NOW_LANG == "ko") {
		setCookie("lang", "jp", 31);
		languageElement.src= "/resources/img/header/lang/jp.png";
	} else if(NOW_LANG == "jp") {
		setCookie("lang", "cn", 31);
		languageElement.src= "/resources/img/header/lang/cn.png";
	} else if(NOW_LANG == "cn") {
		setCookie("lang", "ru", 31);
		languageElement.src= "/resources/img/header/lang/ru.png";
	} else if(NOW_LANG == "ru") {
		setCookie("lang", "en", 31);
		languageElement.src= "/resources/img/header/lang/en.png";
	} else {
		setCookie("lang", "ko", 31);
		languageElement.src= "/resources/img/header/lang/ko.png";
	}
	loadLanguage();
}

setTimeout(checkLanguage, 0);
setTimeout(loadLanguage, 0);