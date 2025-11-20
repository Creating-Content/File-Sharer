// p2p.filesharer.payload.LoginRequest.java
package com.peerlink.fileSharer.payload;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}