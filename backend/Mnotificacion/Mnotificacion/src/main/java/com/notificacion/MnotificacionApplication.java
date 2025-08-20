package com.notificacion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class MnotificacionApplication {

	public static void main(String[] args) {
		SpringApplication.run(MnotificacionApplication.class, args);
	}

}
