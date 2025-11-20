// p2p.filesharer.payload.SignupRequest.java
package com.peerlink.fileSharer.payload;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String password;
}