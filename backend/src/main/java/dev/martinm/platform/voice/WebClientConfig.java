package dev.martinm.platform.voice;

import io.netty.channel.ChannelOption;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient mediasoupWebClient(@Value("${mediasoup.url:http://localhost:3000}") String mediasoupUrl) {
        HttpClient httpClient = HttpClient.create()
                .keepAlive(false)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10000)
                .responseTimeout(Duration.ofSeconds(30));

        return WebClient.builder()
                .baseUrl(mediasoupUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}