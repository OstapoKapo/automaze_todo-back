import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

function removePassword(obj: any) {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
        obj.forEach(removePassword);
    } else {
        if (obj.password) delete obj.password;
        Object.values(obj).forEach(removePassword);
    }
}

@Injectable()
export class ExcludeSensitiveInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => {
                removePassword(data);
                return data;
            })
        );
    }
}