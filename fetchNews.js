const fetchNews = () => {
    const hotelArray = [];
    $('.dcr-16c50tn', html).each(function(){
        const newsTitle = $(this).text();
        const link = $(this).find('a').attr('href');
        newsArray.push({newsTitle, link})
    })
    console.log(newsArray);
}