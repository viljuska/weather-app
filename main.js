document.addEventListener('DOMContentLoaded', () => {
	if ( navigator.geolocation ) {
		let lat, long,
			app_body = document.body,
			weather_location = document.querySelector('.weather-location h1'),
			weather_time = document.querySelector('.weather-time'),
			weather_description = document.querySelector('.weather-description'),
			weather_icon = document.querySelector('.weather-data_icon path'),
			weather_temperature = document.querySelector('.weather-data_temperature p'),
			weather_hourly = document.querySelector('.weather-hourly');

		navigator.geolocation.getCurrentPosition(position => {
			lat = position.coords.latitude;
			long = position.coords.longitude;

			const current_time = convert_time();
			const proxy = 'https://cors-anywhere.herokuapp.com/';
			const api = `${ proxy }https://api.darksky.net/forecast/2ed36afef21571720a5e8bd9ac749ac2/${ lat },${ long },${ current_time }?lang=sr&units=si`;

			fetch(api)
				.then(response => {
					return response.json();
				})
				.then(data => {
					weather_location.textContent = data.timezone;
					// Get current weather
					const { time, summary, icon, temperature } = data.currently;
					weather_description.textContent = summary;
					let weather_current_time = convert_time(time);
					weather_time.innerText = weather_current_time.hours + ':' + weather_current_time.minutes + 'h';
					weather_icon.setAttribute('d', render_icons(icon));
					app_body.classList = icon;
					weather_temperature.innerText = Math.round(temperature);

					// Get hourly weather
					const weather_data = data.hourly.data;
					const cur_time = Date.now();
					let weather_hourly_html = '';
					weather_data.forEach((weather, index) => {
						if ( weather.time * 1000 > cur_time ) {
							let weather_time = convert_time(weather.time);
							weather_hourly_html += `<div class="weather_hour ${ weather.icon }">
											     <p class="weather_time">${ weather_time.hours }</p>
											     <svg version="1.1" class="weather_icon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
				                                    viewBox="0 0 162 160.7" xml:space="preserve">
													<path d="${ render_icons(weather.icon) }"/>
												</svg>
											     <p class="weather_temperature">${ Math.round(weather.temperature) }&deg;C</p>
											     <p class="weather_summ">${ weather.summary }</p>
										     </div>`;
						}
					});
					weather_hourly.innerHTML = weather_hourly_html;

					// Add event listener to buttons
					let buttons = document.querySelectorAll('.weather-hourly_controls .btn');
					buttons.forEach(button => {
						button.addEventListener('click', function () {
							let item_to_scroll = document.querySelector(this.dataset.item);
							let direction_to_scroll = this.dataset.direction;
							scroll_item(item_to_scroll, 150, direction_to_scroll);
						});
					});

				})
				.catch(err => {
					console.log('Error:' + err);
				});
		}, err => {
			console.log('Error:' + err);
		});
	}

	function convert_time(time = '') {
		const days = [ 'Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota' ];
		if ( time === '' ) {
			let full_date_time = new Date();
			let full_date = full_date_time.getFullYear() + '-' + (full_date_time.getMonth() + 1) + '-' + full_date_time.getDate();
			let hours = full_date_time.getHours() < 10 ? '0' + full_date_time.getHours() : full_date_time.getHours();
			let minutes = full_date_time.getMinutes() < 10 ? '0' + full_date_time.getMinutes() : full_date_time.getMinutes();
			let seconds = full_date_time.getSeconds() < 10 ? '0' + full_date_time.getSeconds() : full_date_time.getSeconds();
			return `${ full_date }T${ hours }:${ minutes }:${ seconds }`;
		} else {
			let full_date_time = new Date(time * 1000);
			return {
				year: full_date_time.getFullYear(),
				month: full_date_time.getMonth() + 1,
				day: full_date_time.getDate(),
				day_name: days[full_date_time.getDay()],
				hours: full_date_time.getHours() < 10 ? '0' + full_date_time.getHours() : full_date_time.getHours(),
				minutes: full_date_time.getMinutes() < 10 ? '0' + full_date_time.getMinutes() : full_date_time.getMinutes(),
				seconds: full_date_time.getSeconds() < 10 ? '0' + full_date_time.getSeconds() : full_date_time.getSeconds()
			};
		}
	}

	function render_icons(icon_name) {
		const icons = {
			clear_day: `M117.7,80.4c0,20.5-16.7,37.2-37.2,37.2s-37.2-16.7-37.2-37.2
			S60,43.2,80.5,43.2S117.7,59.8,117.7,80.4z
			M27.1,27.7l19.2,19.2 M80,5.4v27.1 M133.2,26.9L114,46.1 M155.5,79.8h-27.1 M133.9,133l-19.2-19.2 
			M81,155.4v-27.1 M27.9,133.8
			L47,114.6 M5.5,80.9h27.1`,

			partly_cloudy_day: `M50.9,71.6H28 M136.4,115.6l-16.2-16.2 M154.6,70.7h-22.9 M135.8,26.1l-16.2,16.2 M90.9,30.7V7.9 M62.4,42.9
	L46.2,26.7 M91.3,39.8c-17.3,0-31.4,14.1-31.4,31.4c0,4.4,0.9,8.5,2.5,12.3c3.9-1.7,8.2-2.7,12.7-2.7c13,0,24.1,7.9,28.9,19.1
	c11-4.9,18.7-15.9,18.7-28.7C122.7,53.8,108.7,39.8,91.3,39.8z M112.6,114.4h-6.1c0-0.7,0.1-1.4,0.1-2.2c0-4.4-0.9-8.5-2.5-12.3
	c-4.8-11.2-15.9-19.1-28.9-19.1c-4.5,0-8.8,1-12.7,2.7c-6.4,2.8-11.7,7.8-15,13.9c-2.5-2.9-6.1-4.8-10.2-4.8
	c-7.4,0-13.4,6-13.4,13.4c0,3.2,1.1,6.1,3,8.4h-4c-8.3,0-15.1,6.8-15.1,15.1v5.2c0,8.3,6.8,15.1,15.1,15.1h89.7
	c8.3,0,15.1-6.8,15.1-15.1v-5.2C127.7,121.2,120.9,114.4,112.6,114.4z`,

			clear_night: `M152,112c-12,25.1-37.7,42.5-67.4,42.5C43.4,154.4,10,121,10,79.8c0-36.9,26.8-67.5,62-73.6
	c-4.7,9.7-7.3,20.7-7.3,32.2c0,41.2,33.4,74.6,74.6,74.6C143.7,113.1,147.9,112.7,152,112z`,

			partly_cloudy_night: `M156.5,82.2c-6.3,13.3-18.4,23.3-33,26.8h-6.9c0.1-0.8,0.1-1.6,0.1-2.4c0-19.5-15.8-35.3-35.3-35.3
	c-6.2,0-11.9,1.6-17,4.3c-1.5-4.7-2.2-9.6-2.2-14.8c0-24.5,17.8-44.9,41.2-48.9c-3.1,6.5-4.8,13.7-4.8,21.4
	c0,27.4,22.2,49.6,49.6,49.6C151,82.9,153.8,82.6,156.5,82.2z M123.5,109h-6.9c0.1-0.8,0.1-1.6,0.1-2.4c0-19.5-15.8-35.3-35.3-35.3
	c-6.2,0-11.9,1.6-17,4.3c-6,3.3-10.9,8.3-14.2,14.3c-2.8-3.3-6.9-5.4-11.5-5.4c-8.3,0-15,6.7-15,15c0,3.6,1.3,6.9,3.3,9.4h-4.5
	c-9.4,0-17,7.7-17,17v5.8c0,9.4,7.7,17,17,17h100.9c9.4,0,17-7.7,17-17V126C140.4,116.7,132.8,109,123.5,109z`,

			cloudy: `M137.1,79.2h-7.6c0.1-0.9,0.1-1.8,0.1-2.7c0-21.7-17.6-39.2-39.2-39.2c-15,0-28,8.4-34.6,20.7
	c-3.1-3.6-7.7-6-12.8-6c-9.2,0-16.7,7.5-16.7,16.7c0,4,1.4,7.6,3.7,10.5h-5C14.5,79.2,6,87.7,6,98.1v6.5c0,10.4,8.5,18.9,18.9,18.9
	h112.2c10.4,0,18.9-8.5,18.9-18.9v-6.5C156,87.7,147.5,79.2,137.1,79.2z`,

			rain: `M34.7,105.8h-9.8C14.5,105.8,6,97.3,6,86.9v-6.5C6,70,14.5,61.5,24.9,61.5h5c-2.3-2.9-3.7-6.5-3.7-10.5
	c0-9.2,7.5-16.7,16.7-16.7c5.1,0,9.7,2.3,12.8,6c6.6-12.3,19.6-20.7,34.6-20.7c21.7,0,39.2,17.6,39.2,39.2c0,0.9,0,1.8-0.1,2.7h7.6
	c10.4,0,18.9,8.5,18.9,18.9v6.5c0,10.4-8.5,18.9-18.9,18.9h-10.9 M37.8,122l-7.1,7.1 M47.4,134.9l22.3-22.2H45.7l21-21 M87.8,119.4
	l22.3-22.2H86.1l21-21 M66.1,141.2l12.4-12.4 M92.9,137.7l21.1-21.1`,

			sleet: `M34.4,106h-9.8c-10.5,0-19-8.6-19-19v-6.5c0-10.5,8.6-19,19-19h5c-2.3-2.9-3.7-6.6-3.7-10.6
	c0-9.3,7.5-16.8,16.8-16.8c5.2,0,9.8,2.3,12.9,6c6.7-12.4,19.8-20.9,34.8-20.9c21.8,0,39.5,17.7,39.5,39.5c0,0.9,0,1.8-0.1,2.7h7.7
	c10.5,0,19,8.6,19,19v6.5c0,10.5-8.6,19-19,19h-10.9 M37.5,122.3l-7.1,7.1 M78.5,129.1L66,141.6 M93,138.1l21.2-21.2 M61.3,125.5
	V93.4 M71,119.4l-20-20 M76.7,109.6H44.6 M70.6,100l-20,20 M99.6,107.1V78.9 M108,101.8L90.4,84.2 M84.9,93.2h28.2 M107.7,84.7
	l-17.6,17.6`,

			snow: `M156.5,71.9l0,6.5c0,10.5-8.5,19.1-19,19.1L24.6,97.6c-10.5,0-19.1-8.5-19.1-19l0-6.5c0-10.5,8.5-19.1,19-19.1
	l5,0c-2.3-2.9-3.7-6.6-3.7-10.6c0-9.3,7.5-16.8,16.8-16.8c5.2,0,9.8,2.3,12.9,6c6.6-12.4,19.7-20.9,34.8-20.9
	c21.8,0,39.5,17.6,39.5,39.5c0,0.9,0,1.8-0.1,2.7l7.7,0C147.9,52.9,156.5,61.5,156.5,71.9z M51.3,117.9l0,32.1 M60.9,143.9l-20.1-20
	 M66.6,134.1l-32.1,0 M60.5,124.5l-20,20.1 M108.7,139l0-28.2 M99.5,116.1l17.6,17.6 M122.1,125.1l-28.2,0 M116.8,116.6l-17.6,17.6`,

			wind: `M156.5,65.3H71.9c-3.4,0-4.3,0-7.6-0.8c-10.9-2.5-15.9-7.5-15.9-16.8c1-9.9,6.8-15,16.8-15.9
	c10.9,0,15.9,9.2,16.8,18.5 M39.1,68.6c-0.8-9.2-5.9-18.5-16.8-18.5c-10,1-15.8,6.1-16.8,15.9c0,9.2,5,14.3,15.9,16.8
	c3.4,0.8,22.6,0,26,0L156.5,82 M156.5,95.5H76.1c-3.4,0-4.3,0-7.6,0.8c-10.9,2.5-15.9,7.5-15.9,16.8c1,9.9,6.8,15,16.8,15.9
	c10.9,0,15.9-9.2,16.8-18.5`,

			fog: `M156.5,81v6.5c0,10.5-8.6,19-19,19H24.6c-10.5,0-19-8.6-19-19V81c0-10.5,8.6-19,19-19h5
	c-2.3-2.9-3.7-6.6-3.7-10.6c0-9.3,7.5-16.8,16.8-16.8c5.2,0,9.8,2.3,12.9,6c6.7-12.4,19.8-20.9,34.8-20.9
	c21.8,0,39.5,17.7,39.5,39.5c0,0.9,0,1.8-0.1,2.7h7.7C148,62,156.5,70.5,156.5,81z M28.2,120.6h35.2 M84.2,120.6h54.8 M136.2,141
	H101 M80.2,141H25.5`
		};
		return icons[icon_name.replace(/-/g, '_')];
	}

	function scroll_item(item, amount, direction) {
		switch ( direction ) {
			case 'left':
				item.scrollLeft += amount;
				break;
			case 'right':
				item.scrollLeft -= amount;
				break
		}
	}
});