describe('URL Functionality', function () {
    it('cleanUrl should lowercased all values', function () {
        chai.expect(clearUrl("Gmail.COM")).to.equal("gmail.com");
        chai.expect(clearUrl("GMAIL.COM")).to.equal("gmail.com");
    });

    it('cleanUrl should extract only domain or ip address from the URL', function () {
        chai.expect(clearUrl("https://Gmail.COM")).to.equal("gmail.com");
        chai.expect(clearUrl("https://GMAIL.COM/some/resource?key=value")).to.equal("gmail.com");
        chai.expect(clearUrl("https://192.168.0.22/some/resource?key=value")).to.equal("192.168.0.22");
        chai.expect(clearUrl("http://192.168.0.22:8080/")).to.equal("192.168.0.22:8080");
    });
});
