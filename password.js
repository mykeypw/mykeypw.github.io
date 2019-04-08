function clearUrl(url) {
    url = url.toLowerCase();
	return url.replace('http://', '').replace('https://', '').replace('www.', '').split("/")[0];
}